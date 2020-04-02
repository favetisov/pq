import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'client-form-page',
  templateUrl: './client-form.page.html',
  styleUrls: ['./client-form.page.scss'],
})
export class ClientFormPage implements OnInit {
  state = {
    loading: true,
    submitting: false,
    submitConfirm: false,
  };

  constructor() {}

  async ngOnInit() {
    // todo load info by hash
    this.state.loading = false;
  }

  submit() {
    this.state.submitting = true;
    try {
      //submitting
    } catch (e) {}
    this.state.submitting = false;
  }
}
