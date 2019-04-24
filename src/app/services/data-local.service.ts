import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
  guardados: Registro[] = [];

  constructor(private storage: Storage,
              private navController: NavController,
              private iab: InAppBrowser) {
    this.cargarRegistro();
  }

  async guardarRegistro(format: string, text: string) {
    await this.cargarRegistro();
    const nuevoRegistro = new Registro(format, text);
    this.guardados.unshift(nuevoRegistro);
    console.log(this.guardados);
    this.storage.set('registros', this.guardados);
    this.abrirRegistro( nuevoRegistro );
  }
  async cargarRegistro() {
    this.guardados = (await this.storage.get('registros')) || [];
  }

  abrirRegistro(registro: Registro) {
    this.navController.navigateForward('tabs/tab2');
    switch (registro.type) {
      case 'http':
        // abrir el navegdor
        console.log('navegador');
        this.iab.create(registro.text, '_system');
        break;
      case 'geo':
        // abrir el mapa
        console.log('mapa');
        break;
      default:
        break;
    }
  }
}
