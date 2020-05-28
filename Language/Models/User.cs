
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Language.Models {
    public class User {
        public Int32 Id { get; set; }
        public Boolean Active { get; set; }
        public String Name { get; set; }
        public String EmailAddress { get; set; }
        public String PasswordHash { get; set; }
        public List<UserLanguage> Lessons { get; set; }
        public User() {
            Lessons = new List<UserLanguage>();
        }
    }
}