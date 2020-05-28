using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Language.Models {
    public class UserLanguage {
        public String Name { get; set; }
        public Int32 Lesson { get; set; }
        public List<Int32> Reminders { get; set; }
        public UserLanguage() {
            Reminders = new List<Int32>();
        }
    }
}