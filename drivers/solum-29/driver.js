'use strict';

const { Driver } = require('homey');
const axios = require('axios');


class MyDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('MyDriver has been initialized');

  }

  async fetchTags() {
    try {
      const gateway = this.homey.settings.get('gateway');
  
      if (!gateway) {
        this.homey.log('Gateway has not been configured.');
        return []; // Retourneer een lege array als de gateway niet is geconfigureerd
      }
  
      // Voer de GET-aanvraag uit
      const response = await axios.get(`http://${gateway}/get_db?pos=<continu>`);
  
      if (response.data && response.data.tags) {
        return response.data.tags;
      } else {
        this.homey.log('Geen tags gevonden in de respons');
        return []; // Retourneer een lege array als er geen tags zijn gevonden
      }
    } catch (error) {
      this.homey.log('Fout bij het ophalen van de tags:', error.message);
      return []; // Retourneer een lege array bij een fout
    }
  }
  


  async filterAndFormatDevices(tags) {
    // Geen JSON.parse nodig omdat 'tags' al een object is
  
    // Filter de data om alleen objecten met hwType 1 te behouden
    let filteredDevices = tags.filter(device => device.hwType === 1);
  
    // Formatteer de overgebleven objecten
    let formattedDevices = filteredDevices.map(device => ({
        name: `${device.alias}`,
        data: {
            id: device.mac,
        }
    }));
  
    return formattedDevices;
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    try {
      const tags = await this.fetchTags();
      const result = await this.filterAndFormatDevices(tags);
      this.log('Gefilterde en geformatteerde apparaten:', result);
      return result;
    } catch (error) {
      this.log('Fout bij het verwerken van de tags:', error);
      return [];
    }

  }

}

module.exports = MyDriver;
