using Language.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace Language.Controllers {
    public class HomeController : BaseController {

        public JsonResult GetCurrentUser() {
            using (var session = MvcApplication.Store.OpenSession()) {
                Int32 UserId = Int32.Parse(Session["UserId"].ToString());
                var user = session.Load<User>(UserId);
				Response.Cookies["User"].Value = Request.Cookies["User"].Value;
				Response.Cookies["User"].Expires = DateTime.UtcNow.AddYears(10);

                return new JsonNetResult(new {
                    user.Id,
                    user.Name,
                    user.EmailAddress,
                    user.Lessons
                });
            }
        }


        public JsonResult GetTranslation(String text, String language) {
            try {
                using (WebClient client = new WebClient()) {
                    String web_response = client.DownloadString("https://translate.google.so/translate_a/t?ie=UTF-8&tbb=1&oe=UTF-8&tl=" + language + "&client=any_client_id_works&sl=auto&q=" + text);

                    return new JsonNetResult(web_response);
                }
            } catch (WebException ex) {
                var result = new StreamReader(ex.Response.GetResponseStream()).ReadToEnd();
                throw new Exception(result);
            } catch (Exception ex) {
                throw new Exception("Could not estimate location");
            }
        }



        public JsonResult PlaceCore() {
            DoTheThingForCore("Core", 5);
            return new JsonNetResult("Success");
        }

        public void DoTheThingForCore(String wordType, Int32 maxCount) {

            using (var session = MvcApplication.Store.OpenSession()) {
                List<LessonPlannerWord> lessonPlannerWords = new List<LessonPlannerWord>();

                List<LessonPlannerWord> newLPW = new List<LessonPlannerWord>();
                do {
                    newLPW = session.Query<LessonPlannerWord>()
                        .Where(lp => lp.Category == wordType).OrderBy(lp => lp.WordIndex)
                        .Skip(lessonPlannerWords.Count).Take(1024).ToList();
                    lessonPlannerWords.AddRange(newLPW);
                } while (newLPW.Count != 0);

                var random = new Random();

                List<LessonGenerator> generators = session.Query<LessonGenerator>().Take(1024).ToList();

                var wordsInLesson = 0;
                var lessonIndex = 0;
                foreach (var lessonPlannerWord in lessonPlannerWords) {

                    generators[lessonIndex].FocusWords[wordType].Add(lessonPlannerWord.English);

                    if (lessonIndex < 200 - 1) {

                        generators[lessonIndex + 1].StudyWords[wordType].Add(lessonPlannerWord.English);
                        var oneAgo = lessonIndex + 1;

                        Int32 nextStudy = lessonIndex + 3;

                        while (nextStudy < 200) {
                            Int32 maxVariance = (Int32)Math.Round((nextStudy - oneAgo) * 0.24);

                            var currentOne = nextStudy + random.Next(-maxVariance, maxVariance);


                            if (currentOne < 200) {
                                generators[currentOne].StudyWords[wordType].Add(lessonPlannerWord.English);
                            }

                            currentOne = nextStudy + (Int32)Math.Ceiling((nextStudy - oneAgo) * 1.37);

                            oneAgo = nextStudy;
                            nextStudy = currentOne;
                        }

                    }

                    wordsInLesson += 1;

                    if (wordsInLesson == maxCount) {
                        wordsInLesson = 0;
                        lessonIndex += 1;
                    }
                }

                for (var i = 0; i < generators.Count; i++) {
                    if (generators[i].StudyWords[wordType].Count > (maxCount * 10)) {
                        var removed = generators[i].StudyWords[wordType].Take(generators[i].StudyWords[wordType].Count - (maxCount * 10)).ToList();
                        generators[i].StudyWords[wordType].RemoveRange(0, generators[i].StudyWords[wordType].Count - (maxCount * 10));
                        if (i < generators.Count - 1) {
                            generators[i + 1].StudyWords[wordType].AddRange(removed);
                        }
                    }
                }
                session.SaveChanges();
            }
        }


        public JsonResult Translate(String text, String language) {
            
            String translation = "";
            string url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + language + "&dt=t&q=" + HttpUtility.UrlEncode(text);
            String result = "";
            using (WebClient wc = new WebClient()) {
                wc.Headers.Add("user-agent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36");
                
                result = Encoding.UTF8.GetString(Encoding.Default.GetBytes(wc.DownloadString(url)));
            
            int startQuote = result.IndexOf('\"');
            if (startQuote != -1) {
                int endQuote = result.IndexOf('\"', startQuote + 1);
                if (endQuote != -1) {
                    translation = result.Substring(startQuote + 1, endQuote - startQuote - 1);
                }
            }
            
            String translationSpeechUrl = string.Format("https://translate.googleapis.com/translate_tts?ie=UTF-8&q={0}&tl={1}&total=1&idx=0&textlen={2}&client=gtx",
                                                       HttpUtility.UrlEncode(translation),
                                                       language,
                                                       translation.Length);
                wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0");
                wc.Headers.Add("Host", "translate.googleapis.com");
                wc.Headers.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
                wc.Headers.Add("Accept-Language", "en-US,en;q=0.5");
                wc.Headers.Add("Accept-Encoding", "gzip, deflate, br");
                //wc.Headers.Add("Connection", "keep-alive");
                wc.Headers.Add("Upgrade-Insecure-Requests", "1");
                wc.Headers.Add("Cache-Control", "max-age=0");
                String speech = wc.DownloadString(translationSpeechUrl);
                String originalSpeech = speech;

                //speech = Convert.ToBase64String(Encoding.UTF8.GetBytes(originalSpeech));
                speech = Convert.ToBase64String(Encoding.Default.GetBytes(originalSpeech));
                //speech = Encoding.UTF8.GetString(Encoding.Default.GetBytes(originalSpeech));
                //speech = Encoding.Default.GetString(Encoding.UTF8.GetBytes(originalSpeech));
                
                return new JsonNetResult(new { Result = translation, Speech = speech });
            }

        }
    }
}