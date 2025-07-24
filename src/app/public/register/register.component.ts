// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from '../../core/services/auth.service';

// @Component({
//   selector: 'app-register',
//   templateUrl: './register.component.html',
//   styleUrls: ['./register.component.css'],
// })
// export class RegisterComponent {
//   registerForm: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router
//   ) {
//     this.registerForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required],
//     });
//   }

//   async register() {
//     try {
//       // Registrar al usuario en Supabase Authentication
//       const { data, error } = await this.authService.supabase.auth.signUp({
//         email: this.registerForm.value.email,
//         password: this.registerForm.value.password,
//       });

//       if (error) {
//         console.error('Error al registrar el usuario en Auth:', error.message);

//         // Mostrar mensajes de error más específicos según el código de error
//         if (
//           error.message.includes('User already registered') ||
//           error.message.includes('already registered')
//         ) {
//           window.alert('El correo electrónico ya está registrado.');
//         } else if (error.message.includes('Invalid email')) {
//           window.alert('El correo electrónico no es válido.');
//         } else if (error.message.includes('Password should be at least')) {
//           window.alert('La contraseña es demasiado corta.');
//         } else {
//           window.alert('Error al registrar el usuario: ' + error.message);
//         }
//         return;
//       }

//       console.log('Usuario registrado en Auth:', data);
//       window.alert(
//         'Usuario registrado correctamente. Revisá tu correo para confirmar la cuenta.'
//       );
//       this.router.navigate(['/login']);
//     } catch (err) {
//       console.error('Error inesperado:', err);
//       window.alert('Ocurrió un error inesperado.');
//     }
//   }
// }

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async register() {
    try {
      // Registrar al usuario en Supabase Authentication
      const { data, error } = await this.authService.supabase.auth.signUp({
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
      });

      if (error) {
        console.error('Error al registrar el usuario en Auth:', error.message);
        window.alert('Error al registrar el usuario.');
        return;
      }

      console.log('Usuario registrado en Auth:', data);
      this.router.navigate(['/register-success']);
    } catch (err) {
      console.error('Error inesperado:', err);
      window.alert('Ocurrió un error inesperado.');
    }
  }
}
