import React from 'react';

interface AddArticlePageState{
    addArticle: {
        name: string;
        categoryId: number;
        excerpt: string;
        description: string;
        concract: string;
        comment: string;
        sap_number: string;
        stock: ArticleStockComponentDto;
        features: ArticleFeatureComponentDto[];
    }
}

export default class AddArticlePage extends React.Component<{}>{
    state: AddArticlePageState;
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = { 

        }
    }
}