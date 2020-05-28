using Language.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Mvc;

namespace Language.Controllers {
    public class CreateController : BaseController {

        public JsonResult ImportCore() {
            using (var session = MvcApplication.Store.OpenSession()) {
                var coreWords = session.Query<LessonPlannerWord>().Where(w => w.Category == "Core").Take(1024).ToList();
                foreach (var core in coreWords) {
                    session.Delete(core);
                }

                var lines = System.IO.File.ReadAllLines(@"C:\Users\Ellimist\Projects\Language\Language\New Core.csv");
                var index = 0;
                foreach (var line in lines) {
                    var word = new LessonPlannerWord {
                        Category = "Core",
                        English = line,
                        OriginalIndex = index,
                        WordIndex = index
                    };
                    index += 1;
                    session.Store(word);
                }
                session.SaveChanges();
                return new JsonNetResult("Success");
            }
        }


        public JsonResult ImportAll() {
            using (var session = MvcApplication.Store.OpenSession()) {
                var lines = System.IO.File.ReadAllLines(@"C:\Users\Ellimist\Projects\Language\Language\Words.csv");
                Boolean first = true;
                foreach (var line in lines) {
                    if (first == true) {
                        first = false;
                    } else {
                        var pieces = line.Split(',');
                        if (pieces[2] != "Core") {
                            var word = new LessonPlannerWord {
                                Category = pieces[2],
                                English = pieces[1],
                                OriginalIndex = Double.Parse(pieces[3]),
                                WordIndex = Double.Parse(pieces[3])
                            };
                            session.Store(word);
                        }
                    }
                }


                var coreWords = System.IO.File.ReadAllLines(@"C:\Users\Ellimist\Projects\Language\Language\New Core.csv");
                Double index = 0;
                foreach (var coreWord in coreWords) {
                    var word = new LessonPlannerWord {
                        Category = "Core",
                        English = coreWord,
                        OriginalIndex = index,
                        WordIndex = index
                    };
                    session.Store(word);
                    index += 1;

                }
                session.SaveChanges();
                return new JsonNetResult("Success");
            }
        }


        public JsonResult GetLessonGenerator(Int32 lessonId) {
            using (var session = MvcApplication.Store.OpenSession()) {
                LessonGenerator lesson = session.Load<LessonGenerator>(lessonId);
                return new JsonNetResult(lesson);
            }
        }

        public JsonResult GetGeneratedLesson(Int32 lessonId) {
            using (var session = MvcApplication.Store.OpenSession()) {
                GeneratedLesson lesson = session.Load<GeneratedLesson>(lessonId);
                return new JsonNetResult(lesson);
            }
        }

        public JsonResult AddUserLessons() {
            using (var session = MvcApplication.Store.OpenSession()) {
                List<String> languages = new List<string>{
                    "Esperanto",
                    "Japanese",
                    "Russian",
                    "French",
                    "Greek",
                    "Korean",
                    "German",
                    "Spanish",
                    "Romanian",
                    "Thai",
                    "Swedish",
                    "Italian",
                    "Swahili"
                };

                Int32 UserId = Int32.Parse(Session["UserId"].ToString());
                var user = session.Load<User>(UserId);

                foreach (var language in languages) {
                    user.Lessons.Add(new UserLanguage {
                        Name = language,
                        Lesson = 1
                    });
                }

                session.SaveChanges();

                return new JsonNetResult("Success");
            }
        }

        public JsonResult CreateLessons() {
            using (var session = MvcApplication.Store.OpenSession()) {
                List<String> languages = new List<string>{
                    "Esperanto",
                    "Japanese",
                    "Russian",
                    "French",
                    "Greek",
                    "Korean",
                    "German",
                    "Spanish",
                    "Romanian",
                    "Thai",
                    "Swedish",
                    "Italian",
                    "Swahili"
                };

                for (var i = 0; i < languages.Count; i++) {
                    for (var j = 0; j < 400; j++) {
                        var lesson = new Lesson {
                            Id = (i * 400) + j + 1,
                            Language = languages[i],
                            LessonNumber = (j + 1),
                            Phrases = new List<Phrase>()
                        };
                        for (var k = 0; k < 90; k++) {
                            lesson.Phrases.Add(new Phrase {
                                English = "",
                                Translation = ""
                            });
                        }
                        session.Store(lesson);
                    }
                }
                session.SaveChanges();

                return new JsonNetResult("Success");
            }
        }

        public JsonResult GetLessonTemplate(Int32 lessonNumber) {
            using (var session = MvcApplication.Store.OpenSession()) {
                LessonTemplate lessonTemplate = session.Load<LessonTemplate>(lessonNumber);
                if (lessonTemplate == null) {
                    GeneratedLesson generator = session.Load<GeneratedLesson>(lessonNumber);
                    lessonTemplate = new LessonTemplate {
                        Id = lessonNumber,
                        RemainingWords = generator.Words
                    };
                    session.Store(lessonTemplate);
                    session.SaveChanges();
                }
                return new JsonNetResult(lessonTemplate);
            }
        }

        public JsonResult SaveLessonTemplate(LessonTemplate lessonTemplate) {
            using (var session = MvcApplication.Store.OpenSession()) {
                session.Store(lessonTemplate);
                session.SaveChanges();
                return new JsonNetResult("Success");
            }
        }
        public JsonResult SaveLessonTemplateJson(String lessonTemplate) {
            using (var session = MvcApplication.Store.OpenSession()) {
                var template = JsonConvert.DeserializeObject<LessonTemplate>(lessonTemplate);
                session.Store(template);
                session.SaveChanges();
                return new JsonNetResult("Success");
            }
        }

        public JsonResult SavePhrase(Int32 lessonNumber, Int32 phraseIndex, LessonTemplatePhrase phrase) {
            using (var session = MvcApplication.Store.OpenSession()) {
                LessonTemplate lesson = session.Load<LessonTemplate>(lessonNumber);

                lesson.Phrases[phraseIndex] = phrase;

                session.SaveChanges();

                return new JsonNetResult("Success");
            }
        }

        public JsonResult SaveTranslation(Int32 lessonNumber, String language, Int32 phraseIndex, String phrase, String translation) {
            using (var session = MvcApplication.Store.OpenSession()) {
                Lesson lesson = session.Query<Lesson>()
                    .Where(l => l.LessonNumber == lessonNumber && l.Language == language)
                    .FirstOrDefault();

                lesson.Phrases[phraseIndex].English = phrase;
                lesson.Phrases[phraseIndex].Translation = translation;
                session.SaveChanges();

                return new JsonNetResult("Success");
            }
        }

        [AllowAnonymous]
        public JsonResult TranslateSomething() {
            //Thread.Sleep(new Random().Next(1000 * 60, 1000 * 4 * 60));

            using (var session = MvcApplication.Store.OpenSession()) {

                Lesson lesson = session.Query<Lesson>().FirstOrDefault(l => l.Processed == false);
                if (lesson == null) {
                    return new JsonNetResult("No lessons need translating");
                }
                LessonTemplate lessonTemplate = session.Load<LessonTemplate>(lesson.LessonNumber);

                var attempted = 0;

                for (var i = 0; i < lesson.Phrases.Count && attempted < 5; i++) {
                    try {
                        if (lesson.Phrases[i].TranslationLatin == "ce4eb3e12fa6d7940ab33a38d4d816ab") {
                            lesson.Phrases[i].Translation = null;
                        }
                        if (lesson.Phrases[i].Translation == null) {
                            attempted += 1;
                            Phrase newPhrase = new Phrase {
                                English = lessonTemplate.Phrases[i].Text
                            };
                            lesson.Phrases[i] = newPhrase;
                            GetTranslatedPhrase(newPhrase, LanguageCodes[lesson.Language]);

                        } else if (lesson.Phrases[i].TranslationSpeech == null) {
                            attempted += 1;
                            if (LanguageCodes[lesson.Language] == "ja") {
                                lesson.Phrases[i].Translation = TranslateRomajiToHiragana(lesson.Phrases[i].TranslationLatin);
                            }
                            lesson.Phrases[i].TranslationSpeech = GoogleTextToSpeech(InsertWordSpacing(lesson.Phrases[i].Translation), LanguageCodes[lesson.Language]);
                            EmailHelper.Email("sean.forman@burgerfuel.com", "Check Translation", lesson.Language + " " + lesson.LessonNumber + "." + i + ": <br>" + JsonConvert.SerializeObject(new { lesson.Phrases[i].TranslationLatin, lesson.Phrases[i].Translation }));
                        }
                    } catch (Exception ex) {
                        EmailHelper.Email("sean.forman@burgerfuel.com", "Failed Translation", lesson.Language + " " + lesson.LessonNumber + "." + i + ": <br>" + JsonConvert.SerializeObject(lesson.Phrases[i]) + "<br><br>" + ex.ToString());
                    }
                }

                lesson.PhrasesRemaining = lesson.Phrases.Count(p => p.TranslationSpeech == null);

                if (lesson.PhrasesRemaining == 0) {
                    lesson.Processed = true;
                    EmailHelper.Email("sean.forman@burgerfuel.com", "Lesson Processed", lesson.Language + " " + lesson.LessonNumber + " has finished processing");
                }
                session.SaveChanges();
            }
            return new JsonNetResult("Success");
        }

        [AllowAnonymous]
        public JsonResult ShowMe() {
            //Thread.Sleep(new Random().Next(1000 * 60, 1000 * 4 * 60));

            using (var session = MvcApplication.Store.OpenSession()) {

                Lesson lesson = session.Query<Lesson>().FirstOrDefault(l => l.Processed == false);
                if (lesson == null) {
                    return new JsonNetResult("No lessons need translating");
                }
                
                return new JsonNetResult(new { lesson.Id, Phrases = lesson.Phrases.Where(p => p.TranslationSpeech == null) });
            }
        }


        public JsonResult Translate(Int32 lessonNumber, String language, Int32 phraseIndex, String text, Boolean debut) {

            using (var session = MvcApplication.Store.OpenSession()) {
                Lesson lesson = session.Query<Lesson>()
                    .Where(l => l.LessonNumber == lessonNumber && l.Language == language)
                    .FirstOrDefault();
                Phrase newPhrase = new Phrase {
                    English = text
                };
                GetTranslatedPhrase(newPhrase, LanguageCodes[language]);
                lesson.Phrases[phraseIndex] = newPhrase;
                session.SaveChanges();

                return new JsonNetResult(newPhrase);
            }

        }

        void GetTranslatedPhrase(Phrase phrase, String languageCode) {
            using (WebClient wc = new WebClient()) {
                wc.Headers.Add("user-agent", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36");
                String result = "";
                try {
                    result = Encoding.UTF8.GetString(Encoding.Default.GetBytes(wc.DownloadString("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=" + languageCode + "&dt=t&dt=rm&q=" + HttpUtility.UrlEncode(phrase.English))));
                    if (result.IndexOf("2") > 0) {
                        EmailHelper.Email("sean.forman@burgerfuel.com", "Number found in translation", result);

                    }

                    EmailHelper.Email("sean.forman@burgerfuel.com", "Translation result", result);

                } catch (WebException ex) {
                    if (ex.Response != null && ex.Response.GetResponseStream() != null) {
                        throw new Exception("Could not Google Translate: " + new System.IO.StreamReader(ex.Response.GetResponseStream()).ReadToEnd());
                    } else {
                        throw new Exception("Could not Google Translate: " + ex.ToString());
                    }
                }
                int startQuote = result.IndexOf('\"');
                if (startQuote != -1) {
                    int endQuote = result.IndexOf('\"', startQuote + 1);
                    if (endQuote != -1) {
                        phrase.Translation = result.Substring(startQuote + 1, endQuote - startQuote - 1);
                    }
                }


                if (languageCode == "eo") {
                    phrase.TranslationSpeech = GoogleTextToSpeech(InsertWordSpacing(GetEsperanto(phrase.Translation)), "it");
                } else if (languageCode == "ro") {
                    //https://www.freetranslations.org/voice-translator.html#
                    //https://code.responsivevoice.org/getvoice.php?t=sportivului%20juc%C4%83u%C5%9F%20fumeaza%20o%20tigara&tl=ro&sv=&vn=&pitch=0.5&rate=0.2&vol=1
                } else if (languageCode == "ja") {
                    int endRomaji = result.IndexOf("\"en\"");
                    endRomaji = result.LastIndexOf('\"', endRomaji - 1);
                    int startRomaji = result.LastIndexOf('\"', endRomaji - 1) + 1;
                    phrase.TranslationLatin = result.Substring(startRomaji, endRomaji - startRomaji);
                    phrase.TranslationLatin = phrase.TranslationLatin.Replace("ī", "i").Replace("ō", "oo").Replace("ū", "uu").Replace("ā", "aa").Replace("ē", "ee").Replace("Ō", "Oo");
                    phrase.TranslationExtra = phrase.Translation;
                    phrase.Translation = TranslateRomajiToHiragana(phrase.TranslationLatin);

                    phrase.TranslationSpeech = GoogleTextToSpeech(InsertWordSpacing(phrase.Translation), languageCode);
                } else {
                    phrase.TranslationSpeech = GoogleTextToSpeech(InsertWordSpacing(phrase.Translation), languageCode);
                }




                phrase.Speech = GoogleTextToSpeech(phrase.English, "en");
            }

        }

        Dictionary<String, String> LanguageCodes = new Dictionary<String, String>{
        {     "Esperanto", "eo"},
{     "Japanese", "ja"},
{     "Russian", "ru"},
{     "French", "fr"},
{     "Greek", "el"},
{     "Korean", "ko"},
{     "German", "de"},
{     "Spanish", "es"},
{     "Romanian", "ro"},
{     "Thai", "th"},
{     "Swedish", "sv"},
{     "Italian", "it"},
{     "Swahili", "sw"}
    };

        public String TranslateRomajiToHiragana(String romaji) {
            var lookingAt = "";
            var result = "";
            var index = 0;
            var spaceBefore = false;
            romaji = romaji.Replace("-", "").Replace("'", "");
            try {
                while (index < romaji.Length) {
                    if (romaji[index] == ' ') {
                        //Skip spaces
                        spaceBefore = true;
                        result += " ";
                        index += 1;
                        continue;
                    } else if (romaji[index] == '?' || romaji[index] == ',' || romaji[index] == '.') {
                        //Skip special characters
                        index += 1;
                        continue;
                    } else if (JapaneseVowels.Contains(romaji[index].ToString().ToLower())) {
                        //Vowels not proceeded by a consonant are handled here
                        result += Hiragana[romaji[index].ToString().ToLower()];
                        index += 1;
                    } else if ((romaji[index].ToString().ToLower() == "n" || romaji[index].ToString().ToLower() == "m")
                         && (index == romaji.Length - 1 || JapaneseVowels.Contains(romaji[index + 1].ToString().ToLower()) != true)) {
                        result += Hiragana[romaji[index].ToString().ToLower()];
                        index += 1;
                    } else if (index < romaji.Length - 2 && (
                        (romaji[index].ToString() + romaji[index + 1].ToString() + romaji[index + 2].ToString()).ToLower() == "chi"
                        || (romaji[index].ToString() + romaji[index + 1].ToString() + romaji[index + 2].ToString()).ToLower() == "shi"
                        || (romaji[index].ToString() + romaji[index + 1].ToString() + romaji[index + 2].ToString()).ToLower() == "tsu"
                        )) {
                        //Non standard sounds such as Chu
                        result += Hiragana[(romaji[index].ToString() + romaji[index + 1].ToString() + romaji[index + 2].ToString()).ToLower()];
                        index += 3;
                    } else if (index < romaji.Length - 1 && (romaji[index + 1].ToString().ToLower() == "y" ||
                        romaji[index + 1].ToString().ToLower() == "h")) {
                        //Diphthongs are handled here
                        lookingAt = romaji[index].ToString().ToLower() + (romaji[index].ToString().ToLower() == "s" || romaji[index].ToString().ToLower() == "c" ? "h" : "") + "i";
                        result += Hiragana[lookingAt]
                            + Diphthongs[(romaji[index + 1].ToString() + romaji[index + 2].ToString()).ToLower()];
                        index += 3;
                    } else if (
                        (index < romaji.Length - 1 && (romaji[index].ToString() + romaji[index + 1].ToString()).ToLower() == "wa")
                        && (index == romaji.Length - 2 || (index < romaji.Length - 2 && romaji[index + 2].ToString() == " "))) {

                        result += Hiragana["ha"];
                        index += 2;
                    } else if (index < romaji.Length - 1 && romaji[index].ToString() == romaji[index + 1].ToString()) {
                        //motte, kippu
                        result += "っ";
                        index += 1;
                    } else {
                        result += Hiragana[(romaji[index].ToString() + romaji[index + 1].ToString()).ToLower()];
                        index += 2;
                    }
                    spaceBefore = false;
                }
            } catch (System.IndexOutOfRangeException ex) {
                throw new Exception("Out of range at " + index + " char: " + romaji[index]);
            } catch (System.Collections.Generic.KeyNotFoundException ex) {
                throw new Exception("Failed Romaji Conversion " + lookingAt + " char " + romaji[index] + " at index " + index + " " + ex.ToString());
            }
            return result;
        }

        List<String> JapaneseVowels = new List<String> { "a", "e", "i", "o", "u" };
        Dictionary<String, String> Hiragana = new Dictionary<String, String> {
            {"a","あ"},
            {"i","い"},
            {"u","う"},
            {"e","え"},
            {"o","お"},
            {"ka","か"},
            {"ki","き"},
            {"ku","く"},
            {"ke","け"},
            {"ko","こ"},
            {"ga","が"},
            {"gi","ぎ"},
            {"gu","ぐ"},
            {"ge","げ"},
            {"go","ご"},
            {"sa","さ"},
            {"shi","し"},
            {"su","す"},
            {"se","せ"},
            {"so","そ"},
            {"za","ざ"},
            {"zi","じ"},
            {"zu","ず"},
            {"ze","ぜ"},
            {"zo","ぞ"},
            {"ta","た"},
            {"chi","ち"},
            {"tsu","つ"},
            {"te","て"},
            {"to","と"},
            {"da","だ"},
            {"di","ぢ"},
            {"du","づ"},
            {"de","で"},
            {"do","ど"},
            {"na","な"},
            {"ni","に"},
            {"nu","ぬ"},
            {"ne","ね"},
            {"no","の"},
            {"ha","は"},
            {"hi","ひ"},
            {"fu","ふ"},
            {"he","へ"},
            {"ho","ほ"},
            {"ba","ば"},
            {"bi","び"},
            {"bu","ぶ"},
            {"be","べ"},
            {"bo","ぼ"},
            {"pa","ぱ"},
            {"pi","ぴ"},
            {"pu","ぷ"},
            {"pe","ぺ"},
            {"po","ぽ"},
            {"ma","ま"},
            {"mi","み"},
            {"mu","む"},
            {"me","め"},
            {"mo","も"},
            {"ya","や"},
            {"yu","ゆ"},
            {"yo","よ"},
            {"ra","ら"},
            {"ri","り"},
            {"ru","る"},
            {"re","れ"},
            {"ro","ろ"},
            {"wa","わ"},
            {"wi","ゐ"},
            {"we","ゑ"},
            {"wo","を"},
            {"ja","じゃ"},
            {"ju","じゅ"},
            {"jo","じょ"},
            {"n","ん"},
            {"m","ん"}
        };

        Dictionary<String, String> Diphthongs = new Dictionary<String, String> {
            {"ya","ゃ"},
            {"yu","ゅ"},
            {"yo","ょ"},
            {"ha","ゃ"},
            {"hu","ゅ"},
            {"ho","ょ"}
        };

        String InsertWordSpacing(String translation) {
            return translation.Replace(",", ". ,").Replace(" ", ", ");
        }

        String GetEsperanto(String translation) {
            return translation
                .ToLower().Replace("g", "gh").Replace("ŝ", "sh").Replace("ĝ", "sh").Replace("ĉe", "ce").Replace("ĉi", "ci").Replace("ĉ", "ch").Replace("ĝa", "cha").Replace("ĝo", "cho").Replace("ĝu", "chu").Replace("ŭ", "o");
        }


        String GoogleTextToSpeech(String translation, String languageCode) {
            using (WebClient wc = new WebClient()) {
                try {
                    //String translationSpeechUrl = String.Format("https://translate.googleapis.com/translate_tts?ie=UTF-8&q={0}&tl={1}&total=1&idx=0&textlen={2}&client=gtx" + (languageCode != "en" ? "&ttsspeed=0.3" : ""),HttpUtility.UrlEncode(translation), languageCode, translation.Length);
                    String translationSpeechUrl = String.Format("https://translate.googleapis.com/translate_tts?ie=UTF-8&q={0}&tl={1}&total=1&idx=0&textlen={2}&client=gtx", HttpUtility.UrlEncode(translation), languageCode, translation.Length);
                    wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0");
                    wc.Headers.Add("Host", "translate.googleapis.com");
                    wc.Headers.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
                    wc.Headers.Add("Accept-Language", "en-US,en;q=0.5");
                    wc.Headers.Add("Accept-Encoding", "gzip, deflate, br");
                    wc.Headers.Add("Upgrade-Insecure-Requests", "1");
                    wc.Headers.Add("Cache-Control", "max-age=0");
                    return Convert.ToBase64String(Encoding.Default.GetBytes(wc.DownloadString(translationSpeechUrl)));
                } catch (WebException ex) {
                    if (ex.Response != null && ex.Response.GetResponseStream() != null) {
                        throw new Exception(new System.IO.StreamReader(ex.Response.GetResponseStream()).ReadToEnd());
                    } else {
                        throw new Exception(ex.ToString());
                    }
                }
            }
        }

    }
}