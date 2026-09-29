/**
 * @file shop.js
 * Catálogo central de la tienda de DevPet.
 */

export const PET_CATALOG = {
  gato: {
    id: 'gato',
    name: 'Mishi',
    price: 0,
    image: require('../../assets/petStates/DevPet_neutral.png'),
    description: 'Tu compañero inicial. Siempre fiel.'
  },
  conejo: {
    id: 'conejo',
    name: 'Conejo Saltador',
    price: 500,
    image: require('../../assets/petStates/DevPet_Conejo.png'),
    description: 'Rápido y astuto, ideal para sprints de código.'
  },
  mono: {
    id: 'mono',
    name: 'Mono Aventurero',
    price: 500,
    image: require('../../assets/petStates/DevPet_Mono.png'),
    description: 'Experto en explorar bugs en la selva de código.'
  },
  dragon: {
    id: 'dragon',
    name: 'Dragón Imperial',
    price: 1500,
    image: require('../../assets/petStates/DevPet_Dragon.png'),
    description: 'Escupe fuego sobre los errores de compilación.'
  },
  plumitas: {
    id: 'plumitas',
    name: 'Plumitas',
    price: 2000,
    image: require('../../assets/petStates/DevPet_Plumitas.png'),
    description: 'Una leyenda emplumada. La mascota más valiosa y sabia de todas.'
  }
};