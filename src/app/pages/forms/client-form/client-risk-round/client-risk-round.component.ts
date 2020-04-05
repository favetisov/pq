import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'client-risk-round',
  templateUrl: './client-risk-round.component.html',
  styleUrls: ['./client-risk-round.component.scss'],
})
export class ClientRiskRoundComponent implements OnInit {
  @Input() round: any = {};
  @Input() subround: any = {};
  constructor() {}

  async ngOnInit() {}
}
