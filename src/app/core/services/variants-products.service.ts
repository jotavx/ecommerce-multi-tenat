import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Product } from '../models/products.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class VariantsProducts {
  private supabase: SupabaseClient;

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  // VARIANTS
  async createVariant(name: string) {
    await this.authService.getBrand().then(async (brand) => {
      if (brand) {
        const { data, error } = await this.supabase
          .from('business')
          .select('id')
          .eq('brand', brand)
          .single();
        if (error) throw error;
        const businessId = data?.id;

        await this.supabase
          .from('product_variants')
          .insert([{ name, business_id: businessId }]);
      } else {
        throw new Error('No se pudo obtener el brand');
      }
    });
  }

  async getVariantsByBusiness() {
    const brand = await this.authService.getBrand();
    if (brand) {
      const { data, error } = await this.supabase
        .from('business')
        .select('id')
        .eq('brand', brand)
        .single();
      if (error) throw error;
      const businessId = data?.id;

      const { data: variants, error: variantsError } = await this.supabase
        .from('product_variants')
        .select('*')
        .eq('business_id', businessId);

      if (variantsError) throw variantsError;
      return variants;
    } else {
      throw new Error('No se pudo obtener el brand');
    }
  }

  async getAllVariants() {
    const { data, error } = await this.supabase
      .from('product_variants')
      .select('*');

    if (error) throw error;
    return data;
  }

  async updateVariant(id: string, data: { name: string }) {
    const { error } = await this.supabase
      .from('product_variants')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  }

  async updateVariantPriceForProduct(
    variantId: string,
    productId: string,
    customPrice: number
  ) {
    const { error } = await this.supabase
      .from('product_variant_product')
      .update({ custom_price: customPrice })
      .eq('product_variant_id', variantId)
      .eq('product_id', productId);

    if (error) throw error;
  }

  async deleteVariant(id: string) {
    const { error } = await this.supabase
      .from('product_variants')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // CHOICES

  // async createChoice(name: string): Promise<{ id: string }[]> {
  //   const { data, error } = await this.supabase
  //     .from('product_choices')
  //     .insert([{ name }])
  //     .select();

  //   if (error || !data) throw error ?? new Error('Error al crear opción');
  //   return data;
  // }

  async createChoice(name: string) {
    await this.authService.getBrand().then(async (brand) => {
      if (brand) {
        const { data, error } = await this.supabase
          .from('business')
          .select('id')
          .eq('brand', brand)
          .single();
        if (error) throw error;
        const businessId = data?.id;

        await this.supabase
          .from('product_choices')
          .insert([{ name, business_id: businessId }]);
      } else {
        throw new Error('No se pudo obtener el brand');
      }
    });
  }

  async getChoicesByBusiness() {
    const brand = await this.authService.getBrand();
    if (brand) {
      const { data, error } = await this.supabase
        .from('business')
        .select('id')
        .eq('brand', brand)
        .single();
      if (error) throw error;
      const businessId = data?.id;

      const { data: choices, error: choicesError } = await this.supabase
        .from('product_choices')
        .select('*, choice_options(*)')
        .eq('business_id', businessId);

      if (choicesError) throw choicesError;
      return choices;
    } else {
      throw new Error('No se pudo obtener el brand');
    }
  }

  async getAllChoices() {
    const { data, error } = await this.supabase
      .from('product_choices')
      .select('*, choice_options(*)');

    if (error) throw error;
    return data;
  }

  async updateChoice(
    id: string,
    data: {
      name: string;
      seleccionMultiple?: boolean;
      maxQuantity?: number | null;
      requerirMaxParaContinuar?: boolean;
      obligatorio?: boolean;
    }
  ) {
    const { error } = await this.supabase
      .from('product_choices')
      .update({
        name: data.name,
        seleccionMultiple: data.seleccionMultiple,
        maxQuantity: data.maxQuantity,
        requerirMaxParaContinuar: data.requerirMaxParaContinuar,
        obligatorio: data.obligatorio,
      })
      .eq('id', id);

    if (error) throw error;
  }

  async deleteChoice(id: string) {
    const { error } = await this.supabase
      .from('product_choices')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // CHOICE OPTIONES

  async createChoiceOption(choiceId: string, name: string, price?: number) {
    await this.authService.getBrand().then(async (brand) => {
      if (brand) {
        const { data, error } = await this.supabase
          .from('business')
          .select('id')
          .eq('brand', brand)
          .single();
        if (error) throw error;
        const businessId = data?.id;

        await this.supabase
          .from('choice_options')
          .insert([
            { choice_id: choiceId, name, price, business_id: businessId },
          ]);
      } else {
        throw new Error('No se pudo obtener el brand');
      }
    });
  }

  // async createChoiceOption(
  //   choiceId: string,
  //   name: string,
  //   price: number = 0,
  //   stock?: boolean,
  //   counter?: boolean,
  //   quantity?: number
  // ) {
  //   const { data, error } = await this.supabase
  //     .from('choice_options')
  //     .insert([{ choice_id: choiceId, name, price, stock, counter, quantity }]);

  //   if (error) throw error;
  //   return data;
  // }

  async getChoiceOptionsByChoiceId(choiceId: string) {
    const { data, error } = await this.supabase
      .from('choice_options')
      .select('*')
      .eq('choice_id', choiceId);

    if (error) throw error;
    return data;
  }

  async updateChoiceOption(
    id: string,
    data: {
      name: string;
      price: number;
      stock?: boolean;
      counter?: boolean;
      quantity?: number;
    }
  ) {
    const { error } = await this.supabase
      .from('choice_options')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteChoiceOption(id: string) {
    const { error } = await this.supabase
      .from('choice_options')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // MANY TO MANY

  // ASIGNAR variante a producto
  async assignVariantToProduct(
    variantId: string,
    productId: string,
    customPrice?: number
  ) {
    const { error } = await this.supabase
      .from('product_variant_product')
      .insert({
        product_variant_id: variantId,
        product_id: productId,
        custom_price: customPrice, // Nuevo campo
      });

    if (error) throw error;
  }

  // ASIGNAR opción padre a producto
  async assignChoiceToProduct(choiceId: string, productId: string) {
    const { error } = await this.supabase
      .from('product_choice_product')
      .insert({ product_choice_id: choiceId, product_id: productId });

    if (error) throw error;
  }

  // OBTENER variantes de un producto
  async getVariantsByProduct(productId: string) {
    const { data, error } = await this.supabase
      .from('product_variant_product')
      .select(
        `
        product_variants(*),
        custom_price
      `
      )
      .eq('product_id', productId);

    if (error) throw error;

    return data.map((item) => ({
      ...item.product_variants,
      custom_price: item.custom_price,
    }));
  }

  // OBTENER opciones de un producto (con choice_options)
  async getChoicesByProduct(productId: string) {
    const { data, error } = await this.supabase
      .from('product_choice_product')
      .select('product_choices(*, choice_options(*))')
      .eq('product_id', productId);

    if (error) throw error;
    return data.map((item) => item.product_choices);
  }

  // DESASIGNAR variante
  async unassignVariantFromProduct(variantId: string, productId: string) {
    const { error } = await this.supabase
      .from('product_variant_product')
      .delete()
      .eq('product_variant_id', variantId)
      .eq('product_id', productId);

    if (error) throw error;
  }

  // DESASIGNAR opción
  async unassignChoiceFromProduct(choiceId: string, productId: string) {
    const { error } = await this.supabase
      .from('product_choice_product')
      .delete()
      .eq('product_choice_id', choiceId)
      .eq('product_id', productId);

    if (error) throw error;
  }
}
