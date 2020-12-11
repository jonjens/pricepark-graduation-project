using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Areas.Identity.Data;
using WebApplication1.Data;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesApiController : ControllerBase
    {
        private readonly WebApplication1Context _context;
        private readonly UserManager<WebApplication1User> _userManager;

        public FavoritesApiController(UserManager<WebApplication1User> userManager, WebApplication1Context context)
        {
            _context = context;
            _userManager = userManager;
        }


        [HttpPost("{id}")]
        public async Task<ActionResult<ParkingSpot>> PostTodoItem(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            _context.UserFavorites.Add(new UserFavorite
            {
                UserId = user.Id,
                ParkingSpotId = id
            });
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
