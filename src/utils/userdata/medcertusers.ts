// export type LoginType = "uae-pass" | "sheryan";

export interface MedCertUsers {
  userId: string;
  name: string;
  email: string;
  password?: string; // Only for Sheryan login
//   loginType: LoginType;
  role: "admin" | "doctor" | "nurse" ;
  organization?: string; // Hospital/clinic name
}

export const medcertusers: MedCertUsers[] = [
  {
    userId: "1",
    name: "Ayesha Khan",
    email: "admin@gmail.com",
    password: "1234",
    role: "admin",
    organization: "Dubai Hospital"
  },
 
  {
    userId: "2",
    name: "Fatima Al Mazrouei",
    email: "user@gmail.com",
    password: "1234",
    role: "doctor",
    organization: "Dubai Hospital"
  },
  
    {
    userId: "3",
    name: "Fatima Al Mazrouei",
    email: "useri@gmail.com",
    password: "1234",
    role: "nurse",
    organization: "Latifa Hospital"
  },
  

]; 