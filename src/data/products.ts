export interface Product {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    badge?: string;
    badgeColor?: 'gray' | 'yellow';
    category: string;
    longDescription: string;
    dimensions: string;
    included: string[];
    delivery: string;
    notes: string[];
    images: string[];
}

export const products: Product[] = [
    {
        id: '1',
        title: 'Hüpfburg Classic',
        description: 'Klassische Hüpfburg für Kinder von 3-12 Jahren. Perfekt für Geburtstagsfeiern und Events.',
        price: 'ab 120€ / Tag',
        imageUrl: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=800',
        badge: 'Verfügbar',
        badgeColor: 'gray',
        category: 'Hüpfburgen',
        longDescription: 'Unsere klassische Hüpfburg ist der perfekte Spaß für Kindergeburtstage und Familienfeiern. Mit bunten Farben und sicherer Konstruktion sorgt sie für stundenlangen Hüpfspaß.',
        dimensions: '4m x 4m x 3m (L x B x H)',
        included: ['Auf- und Abbau', 'Gebläse', 'Bodenplane', 'Sicherheitsanker'],
        delivery: 'Lieferung im Umkreis von 50km inklusive',
        notes: ['Nur für Outdoor-Nutzung', 'Stromanschluss erforderlich', 'Max. 6 Kinder gleichzeitig'],
        images: [
            'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=800',
            'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800'
        ]
    },
    {
        id: '2',
        title: 'Event-Modul Premium',
        description: 'Modulares Eventsystem mit flexibler Konfiguration. Ideal für größere Veranstaltungen.',
        price: 'ab 250€ / Tag',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
        badge: 'Highlight',
        badgeColor: 'yellow',
        category: 'Eventmodule',
        longDescription: 'Unser Premium Event-Modul bietet maximale Flexibilität für Ihre Veranstaltung. Perfekt kombinierbar mit anderen Modulen für ein einzigartiges Event-Erlebnis.',
        dimensions: '6m x 6m x 4m (L x B x H)',
        included: ['Professioneller Auf- und Abbau', 'Technische Betreuung', 'Beleuchtung', 'Sound-System'],
        delivery: 'Lieferung deutschlandweit möglich',
        notes: ['Indoor und Outdoor geeignet', 'Stromanschluss 230V erforderlich', 'Aufbauzeit ca. 2 Stunden'],
        images: [
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'
        ]
    },
    {
        id: '3',
        title: 'Hüpfburg Prinzessin',
        description: 'Rosa Traumburg für kleine Prinzessinnen. Mit Rutsche und Türmchen.',
        price: 'ab 140€ / Tag',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
        badge: 'Beliebt',
        badgeColor: 'gray',
        category: 'Hüpfburgen',
        longDescription: 'Die Prinzessinnen-Hüpfburg verwandelt jeden Geburtstag in ein märchenhaftes Erlebnis. Mit integrierter Rutsche und märchenhaftem Design.',
        dimensions: '4m x 5m x 3.5m (L x B x H)',
        included: ['Auf- und Abbau', 'Gebläse', 'Bodenplane', 'Sicherheitsanker'],
        delivery: 'Lieferung im Umkreis von 50km inklusive',
        notes: ['Nur für Outdoor-Nutzung', 'Stromanschluss erforderlich', 'Max. 6 Kinder gleichzeitig'],
        images: [
            'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800',
            'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=800',
            'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800'
        ]
    },
    {
        id: '4',
        title: 'Action-Parcours',
        description: 'Actionreicher Hindernis-Parcours für sportliche Herausforderungen.',
        price: 'ab 180€ / Tag',
        imageUrl: 'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800',
        badge: 'Verfügbar',
        badgeColor: 'gray',
        category: 'Eventmodule',
        longDescription: 'Unser Action-Parcours bietet spannende Herausforderungen für Kinder und Jugendliche. Perfekt für Teambuilding und sportliche Events.',
        dimensions: '10m x 4m x 3m (L x B x H)',
        included: ['Auf- und Abbau', 'Gebläse', 'Bodenplane', 'Sicherheitsanker'],
        delivery: 'Lieferung im Umkreis von 50km inklusive',
        notes: ['Nur für Outdoor-Nutzung', 'Stromanschluss erforderlich', 'Geeignet ab 6 Jahren'],
        images: [
            'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800',
            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
            'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=800'
        ]
    },
    {
        id: '5',
        title: 'Hüpfburg Pirat',
        description: 'Piratenschiff-Hüpfburg mit Mast und Segel. Ahoi Piraten!',
        price: 'ab 150€ / Tag',
        imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
        badge: 'Verfügbar',
        badgeColor: 'gray',
        category: 'Hüpfburgen',
        longDescription: 'Setzt die Segel mit unserer Piratenschiff-Hüpfburg! Ein Abenteuer auf hoher See für kleine Seeräuber.',
        dimensions: '5m x 4m x 3m (L x B x H)',
        included: ['Auf- und Abbau', 'Gebläse', 'Bodenplane', 'Sicherheitsanker'],
        delivery: 'Lieferung im Umkreis von 50km inklusive',
        notes: ['Nur für Outdoor-Nutzung', 'Stromanschluss erforderlich', 'Max. 6 Kinder gleichzeitig'],
        images: [
            'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
            'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=800',
            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800'
        ]
    },
    {
        id: '6',
        title: 'Party-Zelt Deluxe',
        description: 'Geräumiges Event-Zelt für bis zu 50 Personen. Mit Beleuchtung und Dekoration.',
        price: 'ab 300€ / Tag',
        imageUrl: 'https://images.unsplash.com/photo-1511578194003-00c80e42dc9b?w=800',
        badge: 'Highlight',
        badgeColor: 'yellow',
        category: 'Eventmodule',
        longDescription: 'Unser Deluxe Party-Zelt bietet den perfekten Rahmen für Ihre Feier. Mit professioneller Beleuchtung und optionaler Dekoration.',
        dimensions: '8m x 6m x 3m (L x B x H)',
        included: ['Professioneller Auf- und Abbau', 'Beleuchtung', 'Bodenplane', 'Befestigung'],
        delivery: 'Lieferung deutschlandweit möglich',
        notes: ['Indoor und Outdoor geeignet', 'Wetterbeständig', 'Aufbauzeit ca. 3 Stunden'],
        images: [
            'https://images.unsplash.com/photo-1511578194003-00c80e42dc9b?w=800',
            'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
        ]
    }
];

export const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
    if (category === 'Alle') return products;
    return products.filter(p => p.category === category);
};

export const categories = ['Alle', 'Hüpfburgen', 'Eventmodule'];
