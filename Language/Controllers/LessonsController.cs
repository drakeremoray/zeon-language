using Language.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Language.Controllers
{
    public class LessonsController : BaseController {
        public JsonResult Get(Int32 lessonNumber, String language){
            using(var session = MvcApplication.Store.OpenSession()) {
                var lesson = session.Query<Lesson>().Where(l => l.LessonNumber == lessonNumber && l.Language == language).FirstOrDefault();
                if (lesson == null) {
                    lesson = new Lesson {
                        Language = language,
                        LessonNumber = lessonNumber
                    };

                    LessonTemplate lessonTemplate = session.Load<LessonTemplate>(lessonNumber);

                    for (var i = 0; i < lessonTemplate.Phrases.Count; i++) {
                        lesson.Phrases.Add(new Phrase());
                    }
                    session.Store(lesson);
                    session.SaveChanges();
                }
                return new JsonNetResult(lesson);
            }
        }

        public JsonResult GetAllLessons() {
            using (var session = MvcApplication.Store.OpenSession()) {
                var lessons = session.Query<Lesson>().Take(1024).ToList();
                return new JsonNetResult(lessons);
            }
        }

        public JsonResult GetAllGenerated() {
            using (var session = MvcApplication.Store.OpenSession()) {
                var generated = session.Load<GeneratedLesson>().Take(1024).ToList();
                return new JsonNetResult(generated);
            }
        }

        public JsonResult GetAllGenerators() {
            using(var session = MvcApplication.Store.OpenSession()) {
                var generators = session.Query<LessonGenerator>().OrderBy(l => l.Id).Take(5).ToList();
                return new JsonNetResult(generators);
            }
        }

        public JsonResult SaveGenerated(GeneratedLesson lesson) {
            using(var session = MvcApplication.Store.OpenSession()) {
                session.Store(lesson);
                session.SaveChanges();
                return new JsonNetResult("Success");
            }
        }
                
        public JsonResult SaveLesson(Lesson lesson) {
            using (var session = MvcApplication.Store.OpenSession()) {
                session.Store(lesson);
                session.SaveChanges();
                return new JsonNetResult(new { LessonId = lesson.Id });
            }
        }
    }
}