import React from 'react';
import api, { ApiResponse } from '../../API/api';

/* Ako imamo potrebu da se stranica učitava prilikom osvježavanja komponente po parametrima
npr. Ako nam treba konkretno neki artikal po articleID, kategorija po categoryID, korisnik po userID
onda koristimo interface koji uzima paramtera koji smo definisali u ruti (u komponenti gdje kreiramo rute)
i naziv tog parametra mora biti isti kao što je u ruti */
interface CategoryPageProperties {
    match: {
        params: {
            categoryID: number;
        }
    }
}

/* Obavezni dio komponente je state (properties nije), u kome definišemo konačno stanje komponente */

interface CategoryPageState {
    /* u ovom dijelu upisuje type npr. ako je kategorija je nekog tipa
    ako u nazivu tog typa stavimo upitnik, time kažemo da nije obavezno polje dolje ispod u konstruktoru */
}

/* U većini slučajeva će biti potrebno napraviti DataTransferObjekat koji će raditi sa podacima,
gdje ćemo definisati da je neka veza primjerak tog DTO-a*/



/* Ova komponenta je proširena da se prikazuje na osnovu parametara koje smo definisali iznad */
export default class CategoriesPage extends React.Component<CategoryPageProperties> {
    state: CategoriesPageState ;

    constructor(props: Readonly<CategoryPageProperties>){
        super(props);
        this.state = {
            articles: []
        }
    }

    /* SET FUNKCIJE ĆEMO DEFINISATI PRIJE RENDERA */
    

    /* KRAJ SET FUNCKIJA */

    render() {
        /* Prije povratne izvršenja returna možemo izvršiti neke provjere */
        /* kraj provjera */
        return(
            /* prikaz klijentu */
        )
    }

    /* GET I MOUNT FUNKCIJE ĆEMO DEFINISATI ISPOD RENDERA */
    componentDidMount(){
        /* Upisujemo funkcije koje se izvršavaju prilikom učitavanja stranice */
    }

    componentDidUpdate(){
        /* Upisujemo logiku koja će se izvršavati nakon update (da se ne osvježava stalno stranica) */
    }

    /* Funkcija za dopremanje podataka, veza sa api-jem  
    api u većini slučajeva traži povratnu informaciju 3 parametra
    api('1', '2', '3'){} 
    1. ruta (provjeriti u backend), 
    2. method (onaj koji definišemo u api da koristimo get, post, patch, delete, update..) 
    3. body (ako je get tj. prazan body stavljamo {} a ako nije unutar {definišemo body}) */
    private getCategoriesData () {
        api('api/category/' + this.props.match.params.categoryID, 'get', {} )
        .then((odgovor: PrimjerOdgovora ) => {
            /* Nakon što se izvrši ruta, šta onda */
        }) 
    }
}
    /* KRAJ GET I MOUNT FUNKCIJA */