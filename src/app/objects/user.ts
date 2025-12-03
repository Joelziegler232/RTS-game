

export interface User {
  id: string; 
  name: string;
  username: string;
  password: string;

  level: number;
  profilePicture?: string;

 
  obreros: number;            

  poblacion: number;         
  poblacionLibre: number;     
  maxPoblacion: number;       

  aumentador: any[];
}
