using System;

namespace WebApplication1.Models
{
    public class ParkingSpot
    {
        public int Id { get; set; }
        public double Breddegrad { get; set; }
        public double Lengdegrad { get; set; }
        public string Navn { get; set; }
        public string Adresse { get; set; }
        public int Postnummer { get; set; }
        public string Poststed { get; set; }
        public string ParkeringstilbyderNavn { get; set; }
        public int Pris { get; set; } = (new Random()).Next(1, 101);
        public int AntallParkeringsplasser { get; set; } = (new Random()).Next(1, 1001);
    }
}
