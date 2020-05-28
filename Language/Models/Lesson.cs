using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Language.Models {

    public class Lesson {
        public Int32 Id { get; set; }
        public Int32 LessonNumber { get; set; }
        public String Language { get; set; }
        public Int32 PhrasesRemaining{ get; set; }
        public Boolean Processed { get; set; }

        public List<Phrase> Phrases { get; set; }
        public Lesson() {
            Phrases = new List<Phrase>();
        }
    }

    public class Phrase {
        public String English { get; set; }
		public String Speech { get; set; }
       
		//Is this even needed? Aren't we sending this to Google Translate?
		//We could precompile and store so we only need TTS
		public String Translation { get; set; }
        public String TranslationLatin { get; set; }
        public String TranslationExtra { get; set; }
        public String TranslationNotes { get; set; }
		public String TranslationSpeech { get; set; }
    }

	public class LessonTemplate {
		public Int32 Id { get; set; }
		public Dictionary<String, List<LessonTemplateWord>> RemainingWords { get; set; }

		public List<LessonTemplatePhrase> Phrases { get; set; }

		public LessonTemplate() {
			RemainingWords = new Dictionary<String, List<LessonTemplateWord>>();

			Phrases = new List<LessonTemplatePhrase>();
		}
	}

	public class LessonTemplatePhrase {
		public String Text { get; set; }
		public Boolean Debut{ get; set; }
	}

	public class LessonTemplateWord {
		public String Word { get; set; }
		public Int32 Index { get; set; }
        public Boolean Focus { get; set; }
	}
	
    public class GeneratedLesson {
        public Int32 Id { get; set; }
        //The list of words in each of the phrases used in the lesson
		public Dictionary<String, List<LessonTemplateWord>> Words { get; set; }
		public GeneratedLesson() {
			Words = new Dictionary<String, List<LessonTemplateWord>>();
		}
    }


    public class LessonGenerator {
        public Int32 Id { get; set; }

        //12 Nouns, 5 Verbs, 4 Adjectives, 8 Core, 1 Adverb
        //9 times that for focus words
        public Dictionary<String, List<String>> FocusWords { get; set; }
        public Dictionary<String, List<String>> StudyWords { get; set; }

        //In each lesson, present 6 words
        public LessonGenerator() {
            FocusWords = new Dictionary<String, List<String>>();
            StudyWords = new Dictionary<String, List<String>>();
        }
    }

    public class LessonPlannerWord {
        public Int32 Id { get; set; }
        public String English { get; set; }
        public String Category { get; set; }
        public Double WordIndex{ get; set; }
		public Double OriginalIndex { get; set; }
	}
    //Using these for generation
    //A lesson has Focus words
    //Split words into lesson sections
    //Display random study words
    //Pick study words by organising focus words by word order
    //When a study word is used, increase the use count, and fling it forward by count * random

    //Inside a lesson, take the 30 focus and 90 study words

    //In each category
    //Take each word, give it random numbers for each repitition it will have
    //Sort the words into one big array, that's the lesson plan

    //Create a lesson





    //Arrange all the words in their orders - planner word
    //Distribute into focus groups - LessonGenerator
    //Distribute into study groups

    //Go through each lesson generator to generate a lesson - GeneratedLesson

    //Now the fun begins, go through each GeneratedLesson to make a lesson proper and compile into phrases

}