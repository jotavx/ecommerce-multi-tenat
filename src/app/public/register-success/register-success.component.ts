import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-success',
  templateUrl: './register-success.component.html',
  styleUrls: ['./register-success.component.css'],
})
export class RegisterSuccessComponent implements OnInit {
  countdown: number = 30;
  intervalId: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.intervalId);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }
}
