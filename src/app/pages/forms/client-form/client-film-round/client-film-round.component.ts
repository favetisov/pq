import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'client-film-round',
  templateUrl: './client-film-round.component.html',
  styleUrls: ['./client-film-round.component.scss'],
})
export class ClientFilmRoundComponent implements OnInit {
  @Input() round: any = {};
  constructor() {}

  async ngOnInit() {}
}
