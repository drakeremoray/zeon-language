using Language.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Language.Controllers
{
    [CustomAuthorise]
    [ErrorHandler]
    public class BaseController : Controller {
        protected Int32 PageSize = 100;
        [AllowAnonymous]
        public ActionResult Index() {
            return View();
        }
    }
}