import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

interface CategoryGroup {
  image: string;
  categoryId: string;
  isOwned?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private supabase: SupabaseClient;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  // Crear una nueva categoría
  // async createNewCategory(categoryData: {
  //   name: string;
  //   description?: string;
  //   image_url?: string;
  // }) {
  //   // Obtener el usuario actual
  //   const {
  //     data: { user },
  //   } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET USER
  //   if (!user) {
  //     throw new Error('Usuario no autenticado');
  //   }

  //   // Obtener el business_id del usuario
  //   const { data: business, error: businessError } = await this.supabase
  //     .from('business')
  //     .select('id')
  //     .eq('user_id', user.id)
  //     .single();

  //   if (businessError || !business) {
  //     throw new Error('No se encontró el negocio asociado a este usuario');
  //   }

  //   // Crear la categoría con el business_id
  //   const { data, error } = await this.supabase
  //     .from('categories')
  //     .insert([
  //       {
  //         name: categoryData.name,
  //         description: categoryData.description,
  //         image_url: categoryData.image_url,
  //         business_id: business.id,
  //       },
  //     ])
  //     .select();

  //   if (error) {
  //     throw error;
  //   }

  //   return data;
  // }

  async createNewCategory(categoryData: {
    name: string;
    description?: string;
    image_url?: string;
  }) {
    // Obtener el usuario optimizado
    const user = await this.authService.ensureUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Obtener el business_id del usuario
    const { data: business, error: businessError } = await this.supabase
      .from('business')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      throw new Error('No se encontró el negocio asociado a este usuario');
    }

    // Crear la categoría
    const { data, error } = await this.supabase
      .from('categories')
      .insert([
        {
          name: categoryData.name,
          description: categoryData.description,
          image_url: categoryData.image_url,
          business_id: business.id,
        },
      ])
      .select();

    if (error) throw error;

    return data;
  }

  // Obtener categorías del negocio actual
  // async getMyBusinessCategories() {
  //   const {
  //     data: { user },
  //   } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET USER

  //   if (!user) {
  //     throw new Error('Usuario no autenticado');
  //   }

  //   const { data, error } = await this.supabase
  //     .from('business')
  //     .select(
  //       `
  //       id,
  //       categories:categories!business_id (
  //         id,
  //         name,
  //         description,
  //         image_url,
  //         created_at
  //       )
  //     `
  //     )
  //     .eq('user_id', user.id);

  //   if (error) {
  //     throw error;
  //   }

  //   return data[0]?.categories || [];
  // }

  async getMyBusinessCategories() {
    const user = await this.authService.ensureUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await this.supabase
      .from('business')
      .select(
        `
        id,
        categories:categories!business_id (
          id,
          name,
          description,
          image_url,
          created_at
        )
      `
      )
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return data[0]?.categories || [];
  }

  // async updateCategory(
  //   categoryId: string,
  //   updateData: {
  //     name: string;
  //     description?: string;
  //     image_url?: string;
  //   }
  // ) {
  //   // Verificar que la categoría pertenezca al negocio del usuario
  //   const {
  //     data: { user },
  //   } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET USER

  //   if (!user) {
  //     throw new Error('Usuario no autenticado');
  //   }

  //   // Verificar ownership
  //   const { data: category, error: fetchError } = await this.supabase
  //     .from('categories')
  //     .select('business_id')
  //     .eq('id', categoryId)
  //     .single();

  //   if (fetchError) {
  //     throw fetchError;
  //   }

  //   const { data: business, error: businessError } = await this.supabase
  //     .from('business')
  //     .select('id')
  //     .eq('user_id', user.id)
  //     .single();

  //   if (businessError || !business) {
  //     throw new Error('No se encontró el negocio asociado');
  //   }

  //   if (category.business_id !== business.id) {
  //     throw new Error('No tienes permisos para editar esta categoría');
  //   }

  //   // Actualizar la categoría
  //   const { data, error } = await this.supabase
  //     .from('categories')
  //     .update(updateData)
  //     .eq('id', categoryId)
  //     .select();

  //   if (error) {
  //     throw error;
  //   }

  //   return data[0];
  // }

  async updateCategory(
    categoryId: string,
    updateData: {
      name: string;
      description?: string;
      image_url?: string;
    }
  ) {
    // Verificar que la categoría pertenezca al negocio del usuario
    const user = await this.authService.ensureUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar ownership
    const { data: category, error: fetchError } = await this.supabase
      .from('categories')
      .select('business_id')
      .eq('id', categoryId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { data: business, error: businessError } = await this.supabase
      .from('business')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      throw new Error('No se encontró el negocio asociado');
    }

    if (category.business_id !== business.id) {
      throw new Error('No tienes permisos para editar esta categoría');
    }

    // Actualizar la categoría
    const { data, error } = await this.supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select();

    if (error) {
      throw error;
    }

    return data[0];
  }

  async getImageUrl(id: string) {
    const { data, error } = await this.supabase
      .from('categories')
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

  // Nuevo método para eliminar categoría junto con la imagen si es que la hay.
  async deleteCategory(id: string, imageUrl?: string): Promise<void> {
    // 1️⃣ Si hay imagen asociada, eliminarla primero
    if (imageUrl) {
      try {
        await this.deleteCategoryImage(id, imageUrl);
      } catch (error) {
        console.error('No se pudo eliminar la imagen asociada:', error);
        // podés decidir si continuar o abortar aquí
      }
    }

    // 2️⃣ Luego eliminar la categoría de la base de datos
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar la categoría:', error.message);
      throw error;
    }
  }

  // async deleteCategory(id: string) {
  //   const { error } = await this.supabase
  //     .from('categories')
  //     .delete()
  //     .eq('id', id);
  //   if (error) throw error;
  // }

  async getGroupedCategories(businessId: string | null) {
    try {
      // 2. Buscar productos con inner join a categorías del business correspondiente
      const { data, error } = await this.supabase
        .from('products')
        .select(
          `
          categories!inner (
            id,
            name,
            image_url,
            business_id
          )
        `
        )
        .eq('categories.business_id', businessId);

      if (error) throw error;

      // 3. Agrupar
      return this.groupCategories(data, !businessId);
    } catch (error) {
      console.error('Error fetching grouped categories:', error);
      throw error;
    }
  }

  private groupCategories(
    products: any[],
    isOwned: boolean
  ): Record<string, CategoryGroup> {
    const grouped: Record<string, CategoryGroup> = {};

    for (const product of products) {
      const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;

      if (!category) continue;

      const categoryName = category.name || 'Sin categoría';

      if (!grouped[categoryName]) {
        grouped[categoryName] = {
          image: category.image_url || 'assets/default-category.jpg',
          categoryId: category.id,
          isOwned,
        };
      }
    }

    return grouped;
  }

  async getProductsByCategory(categoryId: string, businessId: string | null) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);

    if (error) throw error;

    // O también podés traer el nombre desde la tabla categories
    const { data: categoryData } = await this.supabase
      .from('categories')
      .select('name')
      .eq('id', categoryId)
      .eq('business_id', businessId)
      .single();

    return {
      name: categoryData?.name || 'Categoría',
      products: data,
    };
  }

  // async getCurrentBusinessId(): Promise<string> {
  //   const {
  //     data: { user },
  //   } = await this.supabase.auth.getUser(); //⬅⬅⬅⬅⬅⬅⬅⬅ GET USER

  //   if (!user) {
  //     throw new Error('Usuario no autenticado');
  //   }

  //   const { data: business, error } = await this.supabase
  //     .from('business')
  //     .select('id')
  //     .eq('user_id', user.id)
  //     .single();

  //   if (error || !business) {
  //     throw new Error('No se encontró el negocio asociado');
  //   }

  //   return business.id;
  // }

  async getCurrentBusinessId(): Promise<string> {
    const user = await this.authService.ensureUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

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

  async uploadCategoryImage(file: File): Promise<string> {
    const businessId = await this.getCurrentBusinessId(); //⬅⬅⬅⬅⬅⬅⬅⬅ MÉTODO CON GET USER
    const filePath = `${businessId}/categories/${Date.now()}-${file.name}`;

    const { error } = await this.supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicUrl } = this.supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  }

  async deleteCategoryImage(
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
      .from('categories')
      .update({ image_url: '' })
      .eq('id', productId);

    if (updateError) {
      console.error('Error al limpiar campo image_url:', updateError.message);
      throw updateError;
    }
  }
}
