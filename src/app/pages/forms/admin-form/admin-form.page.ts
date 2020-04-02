import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'admin-form-page',
  templateUrl: './admin-form.page.html',
  styleUrls: ['./admin-form.page.scss'],
})
export class AdminFormPage implements OnInit {
  state = {
    loading: true,
  };

  constructor() {}

  async ngOnInit() {}
}
