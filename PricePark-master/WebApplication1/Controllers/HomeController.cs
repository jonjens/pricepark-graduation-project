using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WebApplication1.Models;
using Newtonsoft.Json;
using System.Net.Http;
using Microsoft.AspNetCore.Authorization;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        //[Authorize]
        public async Task<IActionResult> Index()
        {
            List<ParkingSpot> parkingSpotList = new List<ParkingSpot>();
            using (var httpClient = new HttpClient())
            {
                // Henter informasjon om parkeringsplasser fra vegvesen API - ./models/ParkingSpot.cs viser hvilke properties som hentes fra APIet.
                using (var response = await httpClient.GetAsync("https://www.vegvesen.no/ws/no/vegvesen/veg/parkeringsomraade/parkeringsregisteret/v1/parkeringsomraade"))
                {
                    string apiResponse = await response.Content.ReadAsStringAsync();
                    parkingSpotList = JsonConvert.DeserializeObject<List<ParkingSpot>>(apiResponse);
                }
            }
            return View(parkingSpotList);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
