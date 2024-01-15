//const url = 'http://inventory.hopto.org:3005'; // PRODUKCIJA
const url = 'http://192.168.12.144:3005'; // LOKALNA POSAO
//const url = 'http://192.168.0.13:3005'; // LOKALNA KUĆI
export const ApiConfig = {
    API_URL: url,
    TIMEOUT: 15000,
    TEMPLATE_PATH: url + '/prenosnica/'
    /* DODATI I PHOTO PATH AKO BUDE A BITI ĆE */
}