import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {
  guardados: Registro[] = [];

  constructor(
    private storage: Storage,
    private navController: NavController,
    private file: File,
    private emailComposer: EmailComposer,
    private iab: InAppBrowser
  ) {
    this.cargarRegistro();
  }

  async guardarRegistro(format: string, text: string) {
    await this.cargarRegistro();
    const nuevoRegistro = new Registro(format, text);
    this.guardados.unshift(nuevoRegistro);
    console.log(this.guardados);
    this.storage.set('registros', this.guardados);
    this.abrirRegistro(nuevoRegistro);
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
        this.navController.navigateForward(`tabs/tab2/mapa/${registro.text}`);
        break;
      default:
        break;
    }
  }

  enviarCorreo() {
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';
    arrTemp.push(titulos);
    this.guardados.forEach((registro) => {
      const linea = `${registro.type}, ${registro.format}, ${registro.created},${registro.text.replace(
        ',',
        ' '
      )}\n`;
      arrTemp.push(linea);
    });

    console.log(arrTemp.join(''));
    this.crearArchivoFisico(arrTemp.join(''));
  }
  crearArchivoFisico(text: string) {
    this.file
      .checkFile(this.file.dataDirectory, 'registros.csv')
      .then((existe) => {
        console.log('Existe archivo?', existe);
        return this.escribirEnArchivo(text);
      })
      .catch((err) => {
        return this.file
          .createFile(this.file.dataDirectory, 'registros.csv', false)
          .then((creado) => {
            this.escribirEnArchivo(text);
          })
          .catch((err2) => console.log('no se pudo generar el archivo'));
      });
  }
  async escribirEnArchivo(text: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, 'registros.csv', text);
    console.log('Archivo creado');
    console.log(this.file.dataDirectory + 'registros.csv');

    const archivo = `${this.file.dataDirectory}registros.csv`;

    this.emailComposer.isAvailable().then((available: boolean) => {
      if (available) {
        //Now we know we can send
      }
    });

    const email = {
      to: 'pablo.ortiz.barra@gmail.com',
      // cc: 'erika@mustermann.de',
      // bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        archivo
        // 'file://img/logo.png',
        // 'res://icon.png',
        // 'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
        // 'file://README.pdf'
      ],
      subject: 'Backup scans',
      body: 'estos son los backup scan app',
      isHtml: true
    };

    // Send a text message using default options
    this.emailComposer.open(email);
  }
}
