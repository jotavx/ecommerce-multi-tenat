import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async createProduct(productData: {
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    image_url?: string;
    stock?: number;
    brand?: string;
  }) {
    const businessId = await this.getCurrentBusinessId();

    const { data, error } = await this.supabase
      .from('products')
      .insert([
        {
          ...productData,
          business_id: businessId,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  }

  async updateProduct(productId: string, updateData: any) {
    // Limpieza más exhaustiva de los datos
    const cleanData = {
      name: updateData.name,
      description: updateData.description,
      price: updateData.price,
      image_url: updateData.image_url,
      stock: updateData.stock,
      category_id:
        updateData.category_id ||
        (updateData.categories?.id ? updateData.categories.id : null),
    };

    const businessId = await this.getCurrentBusinessId(); //⬅⬅⬅⬅⬅⬅⬅⬅ MÉTODO CON GET USER

    // Verificación de permisos
    const { error: verifyError } = await this.supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .eq('business_id', businessId)
      .single();

    if (verifyError) {
      throw new Error('No tienes permisos para editar este producto');
    }

    // Actualización con datos limpios
    const { data, error } = await this.supabase
      .from('products')
      .update(cleanData)
      .eq('id', productId).select(`
        *,
        category_id (id, name, image_url)
      `);

    if (error) {
      console.error('Error detallado:', {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw error;
    }

    return data[0];
  }

  async getImageUrl(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('image_url')
      .eq('id', id)
      .single();

    if (error) {
      console.error(
        'Error al obtener la imagen de la categoría',
        error.message
      );
      return null;
    }

    return {
      imageUrl: data.image_url,
    };
  }

  // Nuevo método para eliminar el producto junto con la imagen si es que la hay.
  async deleteProduct(id: string, imageUrl?: string): Promise<void> {
    // 1️⃣ Si hay imagen asociada, eliminarla primero
    if (imageUrl) {
      try {
        await this.deleteProductImage(id, imageUrl);
      } catch (error) {
        console.error('No se pudo eliminar la imagen asociada:', error);
      }
    }

    // 2️⃣ Luego eliminar el producto de la base de datos
    const { error } = await this.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar el producto:', error.message);
      throw error;
    }
  }

  // async deleteProduct(id: string) {
  //   const { error } = await this.supabase
  //     .from('products')
  //     .delete()
  //     .eq('id', id);
  //   if (error) throw error;
  // }

  async getProductById(id: string) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error obteniendo el producto:', error);
      return null;
    }

    return data;
  }

  async getCurrentBusinessId(): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ MÉTODO CON GET USER

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data: business, error } = await this.supabase
      .from('business')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error || !business) {
      throw new Error('No se encontró el negocio asociado');
    }

    return business.id;
  }

  async getProductsByBusinessForAdmin() {
    const businessId = await this.getCurrentBusinessId(); //⬅⬅⬅⬅⬅⬅⬅⬅ MÉTODO CON GET USER

    const { data, error } = await this.supabase
      .from('products')
      .select(
        `
        *,
        categories:category_id (id, name, image_url)
      `
      )
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getProductsByBusiness(businessId: string | null) {
    const { data, error } = await this.supabase
      .from('products')
      .select(
        `
        *,
        categories:category_id (id, name, image_url)
      `
      )
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async uploadProductImage(file: File): Promise<string> {
    const businessId = await this.getCurrentBusinessId(); //⬅⬅⬅⬅⬅⬅⬅⬅ MÉTODO CON GET USER
    const filePath = `${businessId}/products/${Date.now()}-${file.name}`;

    const { error } = await this.supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicUrl } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  }

  async deleteProductImage(
    productId: string | undefined,
    imageUrl: string | undefined
  ): Promise<void> {
    if (!imageUrl || !productId) return;

    const bucketName = 'product-images';
    const baseUrl = `https://vqxhtwteqmtgybqyqojt.supabase.co/storage/v1/object/public/${bucketName}/`;
    const filePath = imageUrl.replace(baseUrl, '');

    // 1. Borrar del bucket
    const { error: deleteError } = await this.supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error('Error al eliminar imagen:', deleteError.message);
      throw deleteError;
    }

    // 2. Limpiar campo image_url del producto
    const { error: updateError } = await this.supabase
      .from('products')
      .update({ image_url: '' })
      .eq('id', productId);

    if (updateError) {
      console.error('Error al limpiar campo image_url:', updateError.message);
      throw updateError;
    }
  }
}
