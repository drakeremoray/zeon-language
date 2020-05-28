using Language.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Language.Controllers
{
    [ErrorHandler]
    public class LoginController : Controller
    {
        public JsonResult Login(LoginModel loginModel) {
            using (var session = MvcApplication.Store.OpenSession()) {
                var existingUser = session.Query<User>().Where(u => u.Active == true && u.EmailAddress == loginModel.EmailAddress).FirstOrDefault();
                if (existingUser == null || !PasswordHash.ValidatePassword(loginModel.Password, existingUser.PasswordHash)) {
                    throw new Exception("Incorrect Email Address or Password");
                } else {
                    if (existingUser.Active == false) {
                        throw new Exception("This account has been deleted.");
                    }
                    return SetCurrentUser(existingUser);
                }
            }
        }

        public JsonResult CreateUser() {
            using (var session = MvcApplication.Store.OpenSession()) {
                session.Store(new User {
                    Active = true,
                    EmailAddress = "brentngapare@gmail.com",
                    Name = "Brent",
                    Lessons = new List<UserLanguage> {},
                    PasswordHash = PasswordHash.CreateHash("imacunt")
                });
                session.SaveChanges();
                return new JsonNetResult("Success");
            }
        }

        public JsonResult Logout() {
            Session.Abandon();
            Response.Cookies["User"].Expires = DateTime.UtcNow.AddDays(-5);
            return new JsonNetResult(new { Result = "Logged Out" });
        }


        private JsonResult SetCurrentUser(User user) {

            
            Session["UserId"] = user.Id;
            Session["UserName"] = user.Name;
			//Comment why if you add a check for user cookie
                TimeSpan t = (DateTime.UtcNow - new DateTime(1970, 1, 1));
                Int32 timestamp = (Int32)t.TotalSeconds;

                var payload = new Dictionary<String, Object>() {
                                                                { "iat", timestamp },
                                                                { "UserId", user.Id }
                                                        };


                String token = EncryptionHelper.Encrypt(JsonConvert.SerializeObject(payload), "christmascarol");
                Response.Cookies["User"].Value = token;
                Response.Cookies["User"].Expires = DateTime.UtcNow.AddYears(10);
            
            return new JsonNetResult(new { Result = "Logged In" });
        }

    }
}