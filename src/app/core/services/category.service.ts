import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

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

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  async createNewCategory(categoryData: {
    name: string;
    description?: string;
    image_url?: string;
  }) {
    // Obtener el usuario actual
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

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

    // Crear la categoría con el business_id
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

    if (error) {
      throw error;
    }

    return data;
  }

  // Obtener categorías del negocio actual
  async getMyBusinessCategories() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

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

  async updateCategory(
    categoryId: string,
    updateData: {
      name: string;
      description?: string;
      image_url?: string;
    }
  ) {
    // Verificar que la categoría pertenezca al negocio del usuario
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

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

  async deleteCategory(id: string) {
    const { error } = await this.supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

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
}
