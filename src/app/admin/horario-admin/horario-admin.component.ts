import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../core/services/config.service';
import { HorarioDisponibilidad } from '../../core/models/horario-disponibilidad.model';
import { AuthService } from '../../core/services/auth.service';
import { BusinessService } from '../../core/services/business.service';

@Component({
  selector: 'app-horario-admin',
  templateUrl: './horario-admin.component.html',
})
export class HorarioAdminComponent implements OnInit {
  loading = false;
  horarios: HorarioDisponibilidad[] = [];
  nuevoHorario: HorarioDisponibilidad = { dia: 0, horaInicio: '', horaFin: '' };
  brand: string | null = null;
  businessId: string | null = null;

  dias = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
  ];

  constructor(
    public configService: ConfigService,
    private authService: AuthService,
    private businessService: BusinessService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.brand = await this.authService.getBrand();

      if (this.brand) {
        // console.warn('brand desde horario-admin:', this.brand);

        this.businessId = await this.businessService.getBusinessId(this.brand);
        await this.configService.cargarConfiguracionConRealtime(
          this.businessId
        );

        if (this.businessId) {
          this.horarios = await this.configService.getHorarios(this.businessId);
        } else {
          console.error('No se pudo obtener businessId');
        }
      } else {
        console.error('No se pudo obtener el brand');
      }
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      this.loading = false;
    }
  }

  async cargarHorarios(businessId: string | null) {
    this.loading = true;
    try {
      this.horarios = await this.configService.getHorarios(businessId);
    } finally {
      this.loading = false;
    }
  }

  async agregarHorario() {
    await this.configService.addHorario(this.businessId, this.nuevoHorario);
    this.nuevoHorario = { dia: 0, horaInicio: '', horaFin: '' };
    await this.cargarHorarios(this.businessId);
  }

  async eliminarHorario(id: number) {
    await this.configService.deleteHorario(id);
    await this.cargarHorarios(this.businessId);
  }

  toggleTienda() {
    this.configService.toggleCierreTemporal(this.businessId);
  }
}
