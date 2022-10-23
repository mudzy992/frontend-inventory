export const LangBa = {
    /* Kako budem uređivao koju komponentu tako ću dodavati poruke */
        /* Errors */
        ARTICLE_ON_USER:{
            ERR_READ_CATEGORY : 'Greška prilikom učitavanja kategorije. Osvježite ili pokušajte ponovo kasnije',
            ERR_CONTAINER_ARTICLE_NOT_FOUND : 'Article not found',
            /* BUTTONS */
            BTN_UPGRADE : 'Nadogradi',
            BTN_SAVE : 'Sačuvaj',
            BTN_EDIT : 'Izmjeni',

            /* TEXT */
            MODAL_HEADER_TEXT : 'Nadogradnja opreme',
            MODAL_HEADER_CHANGE_STATUS : 'Promjeni status opreme',
            CARD_HEADER_USER_DETAILS : 'Detalji korisnika',

            /* FORMS */
            MODAL_FORM_DESCRIPTION : 'Poruka za nadogradnju opreme',
            TOOLTIP_NAME : 'Naziv',
            TOOLTIP_VALUE : 'Vrijednost',
            TOOLTIP_DEFAULT_VALUE : 'Zadana vrijednost zaduženja ove opreme je 1 KOM',
            FORM_COMMENT_PLACEHOLDER : 'Razlog razduženja opreme (neobavezno)',
            FORM_SELECT_USER_PLACEHOLDER : 'Izaberi korisnika',
            FORM_LABEL_SERIALNUMBER : 'Serijski broj',
            TOOLTIP_MSG_SERIALNUMBER : 'Serijski broj dodjeljen prilikom prvog zaduživanja opreme, te je u ovom koraku nemoguće promjeniti ga.',
            FORM_LABEL_INV_NUMBER : 'Inventurni broj',
            TOOLTIP_MSG_INV_NUMBER : 'Inventurni broj dodjeljen prilikom prvog zaduživanja opreme, te je u ovom koraku nemoguće promjeniti ga.',
            FORM_LABEL_COMMENT : 'Komentar',

            /* STATUS */
            STATUS_OBLIGATE : 'zaduženo',
            STATUS_DEBT : 'razduženo',
            STATUS_DESTROY : 'otpisano',

            /* MESSAGE */
            NEW_OBLIGATE_LABEL : 'Novo zaduženje na korisnika',
            OBLIGATE_ALERT_INFO : 'Nema podataka o korisniku, oprema razdužena',
            DESTROY_ALERT_WARNING : 'Nema podataka o korisniku, oprema otpisana',

            USER_DETAILS: {
                CARD_HEADER : 'Detalji korisnika',
                NAME: 'Ime: ',
                LASTNAME: 'Prezime: ',
                EMAIL: 'Email: ',
                DEPARTMENT: 'Sektor: ',
                JOBNAME: 'Radno mjesto: ',
                LOCATION: 'Lokacija: ',
            },

            DOCUMENT: {
                ERR_DOCUMENT_TOOLTIO: 'Prenosnica nije generisana',
            },

            UPGRADE_FEATURE: {
                CARD_HEADER: 'Nadogradnja',
                CARD_HEADER2: 'Nadogradnja',
                DATE: 'Datum: '
            },
            ARTICLE_DETAILS: {
                CARD_HEADER: 'Detalji opreme',
                SERIALNUMBER: 'Serijski broj: ',
                DESCRIPTION: 'Detaljan opis',

            },
            TABLE: {
                USER: 'Korisnik',
                STATUS: 'Status',
                COMMENT: 'Komentar',
                DATE_AND_TIME_ACTION: 'Datum i vrijeme akcije',
            },
            STATUS: {
                STATUS: 'Status'
            },
            STOCK: {
                CARD_HEADER: 'U skladištu',
                VALUE_ON_CONCRACT: 'Stanje po ugovoru: ',
                AVAILABLE_VALUE: 'Trenutno stanje: ',
                SAP: 'SAP broj: ',
                IN_STOCK_DATE: 'Stanje na: '
            },
    }
}

export function ModalMessageArticleOnUser(article: string, user: string) {
    return (
        'Da li ste sigurni da želite promjeniti status opreme ' + article + 'sa korisnika ' + user + '?'
    )
}