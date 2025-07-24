// // import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

// // @Injectable({
// //   providedIn: 'root',
// // })
// // export class ThemeService {
// //   private renderer: Renderer2;
// //   private themeKey = 'theme'; // Clave para localStorage

// //   constructor(rendererFactory: RendererFactory2) {
// //     this.renderer = rendererFactory.createRenderer(null, null);
// //   }

// //   applyTheme(): void {
// //     const theme = localStorage.getItem(this.themeKey) || 'light';
// //     if (theme === 'dark') {
// //       this.renderer.addClass(document.body, 'dark');
// //     } else {
// //       this.renderer.removeClass(document.body, 'dark');
// //     }
// //   }

// //   toggleTheme(): void {
// //     const isDark = document.body.classList.contains('dark');
// //     if (isDark) {
// //       this.renderer.removeClass(document.body, 'dark');
// //       localStorage.setItem(this.themeKey, 'light');
// //     } else {
// //       this.renderer.addClass(document.body, 'dark');
// //       localStorage.setItem(this.themeKey, 'dark');
// //     }
// //   }
// // }

// import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
// import { OverlayContainer } from '@angular/cdk/overlay';

// @Injectable({
//   providedIn: 'root',
// })
// export class ThemeService {
//   private renderer: Renderer2;
//   private themeKey = 'theme';

//   constructor(
//     rendererFactory: RendererFactory2,
//     private overlayContainer: OverlayContainer
//   ) {
//     this.renderer = rendererFactory.createRenderer(null, null);
//   }

//   applyTheme(): void {
//     const theme = localStorage.getItem(this.themeKey) || 'light';
//     const isDark = theme === 'dark';

//     this.updateBodyClass(isDark);
//     this.updateOverlayClass(isDark);
//   }

//   toggleTheme(): void {
//     const isDark = document.body.classList.contains('dark');
//     const newIsDark = !isDark;

//     this.updateBodyClass(newIsDark);
//     this.updateOverlayClass(newIsDark);

//     localStorage.setItem(this.themeKey, newIsDark ? 'dark' : 'light');
//   }

//   private updateBodyClass(isDark: boolean): void {
//     if (isDark) {
//       this.renderer.addClass(document.body, 'dark');
//     } else {
//       this.renderer.removeClass(document.body, 'dark');
//     }
//   }

//   private updateOverlayClass(isDark: boolean): void {
//     const overlayContainerElement = this.overlayContainer.getContainerElement();
//     if (isDark) {
//       this.renderer.addClass(overlayContainerElement, 'dark');
//     } else {
//       this.renderer.removeClass(overlayContainerElement, 'dark');
//     }
//   }
// }

import { Injectable, Renderer2, RendererFactory2, OnInit } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private themeKey = 'theme';
  private currentTheme: string;

  constructor(
    rendererFactory: RendererFactory2,
    private overlayContainer: OverlayContainer,
    private router: Router
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.currentTheme = localStorage.getItem(this.themeKey) || 'light';

    // Aplicar el tema inmediatamente al crear el servicio
    this.applyTheme(this.currentTheme);

    // Escuchar cambios de ruta para reaplicar el tema si es necesario
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.applyTheme(this.currentTheme);
      });
  }

  initializeTheme(): void {
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: string): void {
    const isDark = theme === 'dark';
    this.currentTheme = theme;

    this.updateBodyClass(isDark);
    this.updateOverlayClass(isDark);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.themeKey, newTheme);
    this.applyTheme(newTheme);
  }

  private updateBodyClass(isDark: boolean): void {
    if (isDark) {
      this.renderer.addClass(document.body, 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark');
    }
  }

  private updateOverlayClass(isDark: boolean): void {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    if (isDark) {
      this.renderer.addClass(overlayContainerElement, 'dark');
    } else {
      this.renderer.removeClass(overlayContainerElement, 'dark');
    }
  }
}
