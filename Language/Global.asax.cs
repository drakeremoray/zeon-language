using Raven.Client;
using Raven.Client.Document;
using Raven.Client.Embedded;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Language {
    public class MvcApplication : System.Web.HttpApplication {
        public static IDocumentStore Store;
        protected void Application_Start() {
            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            var online = true;

            if (online) {

                Store = new DocumentStore {
                    Url = ConfigurationManager.AppSettings["RavenDBLocation"],
                    DefaultDatabase = "Language"
                };
            } else {
                                                
                try {
                    Directory.Delete(@"C:\Users\Ellimist\Projects\Language\Language\Data", true);
                } catch {
                }
                Store = new EmbeddableDocumentStore {
                    DataDirectory = "Data",
                    DefaultDatabase = "Language",
                    UseEmbeddedHttpServer = true
                };


            }
            Store.Initialize();

        }
    }
}
