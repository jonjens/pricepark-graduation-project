using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models
{
    public class UserFavorite
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; }
        public int ParkingSpotId { get; set; }
    }
}
