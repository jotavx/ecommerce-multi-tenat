import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environmentLogo } from '../../../environments/logo';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.css'],
})
export class CompleteProfileComponent {
  datosForm!: FormGroup;
  loading = false;
  logoUrl = environmentLogo.supabaseLogoUrl;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
    this.setupFormListeners();
  }

  // Inicialización del formulario
  private initializeForm() {
    this.datosForm = this.fb.group({
      // Datos personales (users table)
      nombre: ['', [Validators.required, Validators.maxLength(25)]],
      telefono: [''],
      direccion: [''],
      role: ['user', Validators.required],

      // Datos del negocio (business table)
      nombre_negocio: [''],
      email_negocio: ['', [Validators.email]],
      telefono_negocio: [''],
      descripcion_negocio: [''],
      alias_negocio: [''],
      brand: [''],
    });
  }

  // Configuración de listeners
  private setupFormListeners() {
    this.datosForm.get('role')?.valueChanges.subscribe((role) => {
      role === 'admin'
        ? this.setAdminValidators()
        : this.clearAdminValidators();
      if (role === 'admin') this.setupBrandGenerator();
    });
  }

  // Manejo de validadores
  private setAdminValidators() {
    ['nombre_negocio', 'email_negocio', 'telefono_negocio'].forEach((field) => {
      const control = this.datosForm.get(field);
      field === 'email_negocio'
        ? control?.setValidators([Validators.required, Validators.email])
        : control?.setValidators([Validators.required]);
      control?.updateValueAndValidity();
    });
  }

  private clearAdminValidators() {
    ['nombre_negocio', 'email_negocio', 'telefono_negocio'].forEach((field) => {
      const control = this.datosForm.get(field);
      control?.clearValidators();
      control?.updateValueAndValidity();
    });
  }

  // Generación de brand
  private setupBrandGenerator() {
    this.datosForm.get('nombre_negocio')?.valueChanges.subscribe((nombre) => {
      if (nombre && this.isAdminSelected) {
        this.datosForm.get('brand')?.setValue(this.generateBrand(nombre));
      }
    });
  }

  private generateBrand(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 30);
  }

  // Método principal para guardar datos
  async guardarDatos() {
    if (this.datosForm.invalid) return this.datosForm.markAllAsTouched();

    this.loading = true;
    try {
      const user = await this.getCurrentUser();
      await this.createUserProfile(user);

      const redirectData = this.isAdminSelected
        ? {
            message: await this.handleAdminCreation(user),
            route: '/login',
          }
        : { message: 'Perfil completado exitosamente', route: '/login' };

      this.showSuccessAndRedirect(redirectData.message, redirectData.route);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.loading = false;
    }
  }

  // Operaciones con la base de datos
  private async getCurrentUser() {
    const {
      data: { user },
    } = await this.authService.supabase.auth.getUser();
    if (!user) throw new Error('No hay usuario autenticado');
    return user;
  }

  private async createUserProfile(user: any) {
    const userData = {
      id: user.id,
      email: user.email,
      nombre: this.datosForm.value.nombre,
      telefono: this.datosForm.value.telefono,
      direccion: this.datosForm.value.direccion,
      role: this.datosForm.value.role,
    };

    const { error } = await this.authService.supabase
      .from('users')
      .insert([userData]);
    if (error)
      throw new Error(`Error al guardar datos de usuario: ${error.message}`);
  }

  private async createBusinessProfile(user: any) {
    const businessData = {
      user_id: user.id,
      nombre_negocio: this.datosForm.value.nombre_negocio,
      email: this.datosForm.value.email_negocio,
      telefono: this.datosForm.value.telefono_negocio,
      descripcion: this.datosForm.value.descripcion_negocio,
      alias_negocio: this.datosForm.value.alias_negocio,
      brand: this.datosForm.value.brand,
    };

    const { error } = await this.authService.supabase
      .from('business')
      .insert([businessData]);
    if (error) throw new Error(`Error al registrar negocio: ${error.message}`);
  }

  private async handleAdminCreation(user: any): Promise<string> {
    await this.validateBrand();
    await this.createAdminRecord(user.id);
    await this.createBusinessProfile(user);

    // await this.createDefaultCategory(user.id);
    this.authService.resetAdminStatus();
    return `Por favor, inicia sesión con tu cuenta de administrador. Tu negocio ha sido creado exitosamente.`;
  }

  private async validateBrand() {
    const { data } = await this.authService.supabase
      .from('business')
      .select('brand')
      .eq('brand', this.datosForm.value.brand)
      .single();

    if (data)
      throw new Error(
        'El nombre de negocio ya está en uso. Por favor elige otro.'
      );
  }

  private async createAdminRecord(userId: string) {
    const { error } = await this.authService.supabase
      .from('admin')
      .insert([{ user_id: userId }]);
    if (error) throw new Error(`Error al registrar admin: ${error.message}`);
  }

  // private async createDefaultCategory(userId: string) {
  //   const { data } = await this.authService.supabase
  //     .from('business')
  //     .select('id')
  //     .eq('user_id', userId)
  //     .single();

  //   await this.authService.supabase.from('categories').insert([
  //     {
  //       name: 'General',
  //       business_id: data?.id,
  //     },
  //   ]);
  // }

  // Helpers
  private showSuccessAndRedirect(message: string, route: string) {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['success-snackbar'],
    });
    this.router.navigate([route]);
  }

  private handleError(error: any) {
    console.error('Error:', error);
    this.snackBar.open(
      error.message || 'Ocurrió un error al completar el perfil',
      'Cerrar',
      { duration: 5000, panelClass: ['error-snackbar'] }
    );
  }

  get isAdminSelected(): boolean {
    return this.datosForm.get('role')?.value === 'admin';
  }

  get brandPreview(): string {
    return this.isAdminSelected && this.datosForm.value.brand
      ? `${window.location.origin}/tienda/${this.datosForm.value.brand}`
      : '';
  }
}
