export const boundarySource = {
  name: 'Naogaon union, paurashava and upazila boundaries (OCHA/BBS administrative level 4)',
  url: 'https://data.humdata.org/dataset/administrative-boundaries-of-bangladesh-as-of-2015',
  sourceData:
    'Bangladesh Bureau of Statistics (BBS), OCHA ROAP; source dataset published through Humanitarian Data Exchange.',
  sourceDataUrl:
    'https://data.humdata.org/dataset/administrative-boundaries-of-bangladesh-as-of-2015',
  license: 'CC BY 3.0 IGO',
  note:
    'unions.geojson holds 99 unions and 3 paurashavas of Naogaon with Bengali names matched to the official upazila-wise union list. District and upazila outlines are dissolved from these areas at runtime, so territory borders and outlines always agree. This is an administrative boundary product, not a cadastral survey.',
} as const
