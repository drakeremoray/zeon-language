using Language.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Language.Controllers
{
    public class SettingsController : BaseController
    {
		// GET: Settings
		public JsonResult SaveUserLessons(List<UserLanguage> lessons) {
			using (var session = MvcApplication.Store.OpenSession()) {
				Int32 UserId = Int32.Parse(Session["UserId"].ToString());
				var user = session.Load<User>(UserId);
				user.Lessons = lessons;
				session.SaveChanges();
				return new JsonNetResult("Success");
			}
		}
    }
}