using Language.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Language.Controllers {
    public class GenerateController : BaseController {
        public JsonResult GetWords() {
            using (var session = MvcApplication.Store.OpenSession()) {
                var words = new List<LessonPlannerWord>();

                List<LessonPlannerWord> newLPW = new List<LessonPlannerWord>();
                do {
                    newLPW = session.Query<LessonPlannerWord>()
                        .Skip(words.Count).Take(1024).ToList();
                    words.AddRange(newLPW);
                } while (newLPW.Count != 0);

                foreach (var word in words) {
                    word.OriginalIndex = word.WordIndex;
                }
                session.SaveChanges();

                Dictionary<String, List<LessonPlannerWord>> wordDictionary = words.GroupBy(w => w.Category).ToDictionary(s => s.Key, s => s.OrderBy(w => w.WordIndex).ToList());

                return new JsonNetResult(wordDictionary);
            }

        }

        public JsonResult BoostWord(Int32 wordId, Double wordIndex) {
            using (var session = MvcApplication.Store.OpenSession()) {
                LessonPlannerWord word = session.Load<LessonPlannerWord>(wordId);
                word.WordIndex = wordIndex;
                session.SaveChanges();
                return new JsonNetResult("Success");
            }
        }

        public JsonResult PlaceInGeneratedLessons() {
            using (var session = MvcApplication.Store.OpenSession()) {

                var words = new List<LessonPlannerWord>();

                List<LessonPlannerWord> newLPW = new List<LessonPlannerWord>();
                do {
                    newLPW = session.Query<LessonPlannerWord>()
                        .Skip(words.Count).Take(1024).ToList();
                    words.AddRange(newLPW);
                } while (newLPW.Count != 0);

                Dictionary<String, List<LessonPlannerWord>> wordDictionary = words.GroupBy(w => w.Category).ToDictionary(s => s.Key, s => s.ToList());

                List<LessonGenerator> lessonGenerators = new List<LessonGenerator>();
                for (var i = 0; i < 300; i++) {
                    LessonGenerator lessonGenerator = new LessonGenerator {
                        Id = i + 1,
                        FocusWords = new Dictionary<String, List<String>>(),
                        StudyWords = new Dictionary<String, List<String>>()
                    };
                    lessonGenerators.Add(lessonGenerator);
                    session.Store(lessonGenerator);
                }

                //2400 nouns

                var random = new Random();
                var usingCore = wordDictionary["Core"].OrderBy(w => w.WordIndex).ToList();
                List<LessonPlannerWord> coreWords = new List<LessonPlannerWord>();
                foreach (var word in usingCore) {
                    coreWords.Add(word);
                }
                foreach (var word in usingCore) {
                    coreWords.Add(word);
                }
                foreach (var word in usingCore) {
                    coreWords.Add(word);
                }
                foreach (var word in usingCore) {
                    if (coreWords.Count < 900) {
                        coreWords.Insert(random.Next(280, coreWords.Count), word);
                    }
                }

                CreateGenerator(lessonGenerators, wordDictionary["Noun"].OrderBy(w => w.WordIndex).ToList(), "Noun", 8);
                CreateGenerator(lessonGenerators, wordDictionary["Adjective"].OrderBy(w => w.WordIndex).ToList(), "Adjective", 4);
                CreateGenerator(lessonGenerators, wordDictionary["Verb"].OrderBy(w => w.WordIndex).ToList(), "Verb", 3);
                CreateGenerator(lessonGenerators, coreWords, "Core", 3);
                
                List<GeneratedLesson> generatedLessons = new List<GeneratedLesson>();
                var totalWords = 0;
                foreach (var lessonGenerator in lessonGenerators) {

                    GeneratedLesson generatedLesson = new GeneratedLesson {
                        Id = lessonGenerator.Id,
                        Words = new Dictionary<String, List<LessonTemplateWord>>()
                    };
                    TurnGeneratorIntoLesson(lessonGenerator, generatedLesson, "Noun");
                    TurnGeneratorIntoLesson(lessonGenerator, generatedLesson, "Adjective");
                    TurnGeneratorIntoLesson(lessonGenerator, generatedLesson, "Verb");
                    TurnGeneratorIntoLesson(lessonGenerator, generatedLesson, "Core");

                    totalWords += generatedLesson.Words["Noun"].Count + generatedLesson.Words["Adjective"].Count +
                        generatedLesson.Words["Verb"].Count + generatedLesson.Words["Core"].Count;

                    generatedLessons.Add(generatedLesson);
                    session.Store(generatedLesson);
                }

                session.SaveChanges();


                return new JsonNetResult("Success");
            }
        }

        void CreateGenerator(List<LessonGenerator> generators, List<LessonPlannerWord> words, String wordType, Int32 focusCount) {
            foreach (var generator in generators) {
                generator.FocusWords[wordType] = new List<String>();
                generator.StudyWords[wordType] = new List<String>();
            }

            var random = new Random();

            var generatorIndex = 0;
            var focusIndex = 0;

            var verbJumpModifier = 0.9925;
      


            var studyJump1 = 1.02 * verbJumpModifier;
            var placements1 = 0;

            //9600
            
            //0.99
            //10552

            //0.9925
            //

            //0.994
            //9039

            //0.995
            //8732

            //0.0997
            //8201

            

            //1.1
            //2679

            //6750
            //5250
            //3750
            //4500
                        

            var studyJump2 = 1.119 * verbJumpModifier;
            var placements2 = 0;

            //14000

            //1.1
            //15475

            //1.119
            //


            //1.12
            //13936

            //1.15
            //12263


            var studyJump3 = 1.198 * verbJumpModifier;
            var placements3 = 0;

            //10000

            //1.15
            //11634

            //1.18
            //10543

            //1.19
            //10231


            //1.198
            //

            //1.2
            //9939

            var studyJump4 = 1.5 * verbJumpModifier;
            var placements4 = 0;

            //6000
            
            //1.5
            //6051


            var studyJump5 = 100 * verbJumpModifier;
            var placements5 = 0;

            //4000
            
            //1.2
            //17119

            //1.5
            //12095

            //2
            //9767

            //4
            //7860

            //10
            //6771

            //100

            var currentStudyJump = studyJump1;
            var currentPlacements = 0;

            for (var i = 0; i < words.Count; i++) {
                generators[generatorIndex].FocusWords[wordType].Add(words[i].English);

                Double studyIndex = 1;
                           
                Int32 nextPlacement = generatorIndex + 1;

                if (nextPlacement < 300) {
                    for (var k = 0; k < 5; k++) {
                        generators[nextPlacement].StudyWords[wordType].Add(words[i].English);
                    }
                    currentPlacements += 5;
                }
                nextPlacement += 1;

                while (nextPlacement < 300) {
                    generators[nextPlacement].StudyWords[wordType].Add(words[i].English);

                    currentPlacements += 1;
                    studyIndex = studyIndex * currentStudyJump + 1;
                    
                    nextPlacement = (Int32)studyIndex + generatorIndex;
                    nextPlacement = random.Next((Int32)Math.Round(nextPlacement * 0.95), (Int32)Math.Round(nextPlacement * 1.05));
                }

                focusIndex += 1;
                if (focusIndex >= focusCount) {
                    focusIndex = 0;
                    generatorIndex += 1;

                    if (generatorIndex == 175) {
                        placements4 = currentPlacements;
                        currentPlacements = 0;
                        currentStudyJump = studyJump5;
                    } else if (generatorIndex == 125) {
                        placements3 = currentPlacements;
                        currentPlacements = 0;
                        currentStudyJump = studyJump4;
                    } else if (generatorIndex == 75) {
                        placements2 = currentPlacements;
                        currentPlacements = 0;
                        currentStudyJump = studyJump3;
                    } else if (generatorIndex == 25) {
                        placements1 = currentPlacements;
                        currentPlacements = 0;
                        currentStudyJump = studyJump2;
                    }
                }

                if (generatorIndex > 299) {
                    i = words.Count;
                }
            }

            placements5 = currentPlacements;

            if(wordType == "Verb") {
                
            }
            var studyGeneratorIndex = 0;
            //Shift so study words is even
            foreach (var generator in generators) {
                if (generator.StudyWords[wordType].Count > 400) {//While
                    /*var removedWord = generator.StudyWords[wordType][random.Next(generator.StudyWords[wordType].Count)];
                    generator.StudyWords[wordType].Remove(removedWord);
                    if (studyGeneratorIndex < 299) {
                        generators[studyGeneratorIndex + 1].StudyWords[wordType].Add(removedWord);
                    }*/
                }
                studyGeneratorIndex += 1;
            }
        }

        void TurnGeneratorIntoLesson(LessonGenerator generator, GeneratedLesson lesson, String wordType) {
            lesson.Words[wordType] = new List<LessonTemplateWord>();

            var random = new Random();

            var wordIndex = 0;
            foreach (var focusWord in generator.FocusWords[wordType]) {

                if (wordType == "Adjective" || wordType == "Noun") {
                    for (var i = 0; i < 8; i++) {
                        lesson.Words[wordType].Add(new LessonTemplateWord { Word = focusWord, Index = (Int32)(random.NextDouble() * 8 + i * 8) });
                    }
                    for (var i = 0; i < 10; i++) {
                        lesson.Words[wordType].Add(new LessonTemplateWord { Word = focusWord, Index = (Int32)(random.Next(64, 196)) });
                    }
                } else if (wordType == "Verb") {
                    for (var i = 0; i < 5; i++) {
                        lesson.Words[wordType].Add(new LessonTemplateWord { Word = focusWord + GetVerbMod(generator.Id, random), Index = (Int32)(i + wordIndex * 5 + 64) });
                    }
                    for (var i = 0; i < 15; i++) {
                        lesson.Words[wordType].Add(new LessonTemplateWord { Word = focusWord + GetVerbMod(generator.Id, random), Index = random.Next(64 + 15, 196) });
                    }
                } else {
                    for (var i = 0; i < 30; i++) {
                        lesson.Words[wordType].Add(new LessonTemplateWord { Word = focusWord, Index = random.Next(196) });
                    }
                }

                wordIndex += 1;
            }

            var studySectionStudyVerbs = 0;

            foreach (var word in generator.StudyWords[wordType]) {

                if (wordType == "Adjective" || wordType == "Noun") {
                    lesson.Words[wordType].Add(new LessonTemplateWord { Word = word, Index = random.Next(64, 196) });
                } else if (wordType == "Verb") {
                    if (studySectionStudyVerbs < 132) {
                        studySectionStudyVerbs += 1;
                        lesson.Words[wordType].Add(new LessonTemplateWord { Word = word + GetVerbMod(generator.Id, random), Index = random.Next(64, 196) });
                    } else {
                        lesson.Words[wordType].Add(new LessonTemplateWord { Word = word + GetVerbMod(generator.Id, random), Index = random.Next(64) });

                    }

                } else {
                    lesson.Words[wordType].Add(new LessonTemplateWord { Word = word, Index = random.Next(196) });
                }

            }

            lesson.Words[wordType] = lesson.Words[wordType].OrderBy(l => l.Index).ToList();
        }


        public String GetVerbMod(Int32 lessonId, Random random) {
            var verbTake = 21;

            if (lessonId < 5) {
                verbTake = 5;
            } else if (lessonId < 21) {
                verbTake = lessonId;
            }
            return " - " + VerbForms[random.Next(0, verbTake)];
        }

        List<String> Pronouns = new List<String> {//Half possessive
            "N","I","N","Y","N","H","N","S","N","W", "N","T"
        };

        List<String> VerbForms = new List<String> {//Noun twice because it's more common
                    "","Ic","Yc","Hc","Sc","Tc","Wc","Nc",
                    "Nf","If","Yf","Hf","Sf","Tf","Wf","Nf",
                    "Np","Ip","Yp","Hp","Sp","Tp","Wp","Np"
                };



    }
}