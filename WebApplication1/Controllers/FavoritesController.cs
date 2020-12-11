using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using WebApplication1.Areas.Identity.Data;
using System.Net.Http;
using Newtonsoft.Json;
using WebApplication1.ViewModels;

namespace WebApplication1.Controllers
{
    public class FavoritesController : Controller
    {
        private readonly ConnectionStringClass _cc;
        private readonly UserManager<WebApplication1User> _userManager;

        public FavoritesController(ConnectionStringClass cc, UserManager<WebApplication1User> userManager)
        {
            _cc = cc;
            _userManager = userManager;
        }

        [Authorize]
        public async Task<IActionResult> Favorites()
        {
            var user = await _userManager.GetUserAsync(User);
            var userFavorites = await _cc.UserFavorites.Where(x => x.UserId == user.Id).ToListAsync();

            List<ParkingSpot> parkingSpotList;
            using (var httpClient = new HttpClient())
            {
                // Henter informasjon om parkeringsplasser fra vegvesen API - ./models/ParkingSpot.cs viser hvilke properties som hentes fra APIet.
                using (var response = await httpClient.GetAsync("https://www.vegvesen.no/ws/no/vegvesen/veg/parkeringsomraade/parkeringsregisteret/v1/parkeringsomraade"))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    parkingSpotList = JsonConvert.DeserializeObject<List<ParkingSpot>>(apiResponse);
                }
            }

            var favorites = new List<Favorite>();
            foreach (var userFavorite in userFavorites)
            {
                var parkingSpot = parkingSpotList.FirstOrDefault(x => x.Id == userFavorite.ParkingSpotId);
                if (parkingSpot == null)
                {
                    continue;
                }

                favorites.Add(new Favorite
                {
                    Id = parkingSpot.Id,
                    Address = parkingSpot.Adresse,
                    Pris = parkingSpot.Pris
                });
            }

            return View(favorites);
        }
    }
}
