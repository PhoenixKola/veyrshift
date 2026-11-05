// Catalog only. Only Kairo has functional prototype combat. Names require IP clearance.
export type HeroCatalogItem = { id: string; name: string; archetype: string; color: string; state: 'prototype'|'planned'; };
export const HEROES: readonly HeroCatalogItem[] = [
  {id:'kairo',name:'Kairo Venn',archetype:'Kinetic Brawler',color:'#ef9a71',state:'prototype'},
  {id:'lyra',name:'Lyra Kest',archetype:'Gravity Acrobat',color:'#7cddcc',state:'planned'},
  {id:'bram',name:'Bram Roux',archetype:'Seismic Bruiser',color:'#c9b38b',state:'planned'},
  {id:'noxi',name:'Noxi Vale',archetype:'Echo Duelist',color:'#a19be8',state:'planned'},
  {id:'pip',name:'Pip Ardo',archetype:'Spark Mechanic',color:'#f2d76e',state:'planned'},
  {id:'nyvelle',name:'Nyvelle Oris',archetype:'Prism Duelist',color:'#f2abbf',state:'planned'}
] as const;
