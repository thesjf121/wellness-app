import React, { useState, useEffect } from 'react';

interface QuizAssessmentExerciseProps {
  exerciseId: string;
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  config: {
    questions: QuizQuestion[];
    passingScore: number;
    timeLimit?: number; // in minutes
    randomizeQuestions?: boolean;
    showFeedback?: boolean;
  };
}

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'multiple_select';
  question: string;
  options: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points?: number;
}

interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

export const QuizAssessmentExercise: React.FC<QuizAssessmentExerciseProps> = ({
  exerciseId,
  userId,
  onSubmit,
  onCancel,
  config
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    config.timeLimit ? config.timeLimit * 60 : null
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Initialize questions (randomize if needed)
  useEffect(() => {
    const questionList = [...config.questions];
    if (config.randomizeQuestions) {
      questionList.sort(() => Math.random() - 0.5);
    }
    setQuestions(questionList);
  }, [config.questions, config.randomizeQuestions]);

  // Timer effect
  useEffect(() => {
    if (!config.timeLimit || showResults) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = (config.timeLimit * 60) - elapsed;
      
      if (remaining <= 0) {
        handleQuizComplete();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, config.timeLimit, showResults]);

  const currentQuestion = questions[currentQuestionIndex];

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string | string[]) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!currentQuestion) return;

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = checkAnswer(selectedAnswer, currentQuestion.correctAnswer);

    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      isCorrect,
      timeSpent
    };

    setAnswers([...answers, newAnswer]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setQuestionStartTime(Date.now());
    } else {
      handleQuizComplete();
    }
  };

  const checkAnswer = (userAnswer: string | string[], correctAnswer: string | string[]): boolean => {
    if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
      return userAnswer.length === correctAnswer.length && 
             userAnswer.every(ans => correctAnswer.includes(ans));
    }
    return userAnswer === correctAnswer;
  };

  const handleQuizComplete = () => {
    setShowResults(true);
  };

  const calculateScore = (): number => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((question, index) => {
      const points = question.points || 1;
      totalPoints += points;
      
      const answer = answers[index];
      if (answer?.isCorrect) {
        earnedPoints += points;
      }
    });

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    const totalTime = Date.now() - startTime;
    
    const data = {
      exerciseId,
      userId,
      score,
      passingScore: config.passingScore,
      passed: score >= config.passingScore,
      answers,
      totalTime,
      completedAt: new Date(),
      config
    };

    onSubmit(data);
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= config.passingScore;
    const correctAnswers = answers.filter(a => a.isCorrect).length;

    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
        <div className="text-center mb-8">
          <div className={`text-6xl mb-4 ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {passed ? '🎉' : '📚'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          <div className={`text-4xl font-bold ${passed ? 'text-green-600' : 'text-red-600'} mb-2`}>
            {score}%
          </div>
          <p className="text-gray-600">
            You got {correctAnswers} out of {questions.length} questions correct
          </p>
          <p className={`text-sm ${passed ? 'text-green-600' : 'text-red-600'} mt-2`}>
            {passed ? `✓ Passed (Required: ${config.passingScore}%)` : `✗ Not Passed (Required: ${config.passingScore}%)`}
          </p>
        </div>

        {config.showFeedback && (
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-900">Review Your Answers</h3>
            {questions.map((question, index) => {
              const answer = answers[index];
              if (!answer) return null;

              return (
                <div key={question.id} className={`p-4 rounded-lg border ${
                  answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 flex-1">
                      {index + 1}. {question.question}
                    </p>
                    <span className={`text-lg ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p className="text-gray-700">
                      Your answer: <span className="font-medium">
                        {Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}
                      </span>
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-green-700">
                        Correct answer: <span className="font-medium">
                          {Array.isArray(question.correctAnswer) 
                            ? question.correctAnswer.join(', ') 
                            : question.correctAnswer}
                        </span>
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-gray-600 mt-2 italic">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={handleSubmitQuiz}
            className={`flex-1 py-3 px-6 rounded-lg font-medium ${
              passed 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {passed ? 'Complete Quiz' : 'Submit Results'}
          </button>
          {!passed && (
            <button
              onClick={() => {
                // Reset quiz
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setSelectedAnswer('');
                setShowResults(false);
                setStartTime(Date.now());
                setQuestionStartTime(Date.now());
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        
        {timeRemaining !== null && (
          <div className={`text-lg font-medium ${
            timeRemaining < 60 ? 'text-red-600' : 'text-gray-600'
          }`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {currentQuestion.question}
        </h3>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.type === 'multiple_choice' && (
            <>
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </>
          )}

          {currentQuestion.type === 'true_false' && (
            <>
              {['True', 'False'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </>
          )}

          {currentQuestion.type === 'multiple_select' && (
            <>
              <p className="text-sm text-gray-600 mb-2">Select all that apply:</p>
              {currentQuestion.options.map((option, index) => {
                const selected = Array.isArray(selectedAnswer) && selectedAnswer.includes(option);
                
                return (
                  <label
                    key={index}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                      selected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={option}
                      checked={selected}
                      onChange={(e) => {
                        const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
                        if (e.target.checked) {
                          handleAnswerSelect([...currentAnswers, option]);
                        } else {
                          handleAnswerSelect(currentAnswers.filter(a => a !== option));
                        }
                      }}
                      className="mr-3"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Exit Quiz
        </button>
        
        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
          className={`px-6 py-2 rounded-lg font-medium ${
            selectedAnswer && (!Array.isArray(selectedAnswer) || selectedAnswer.length > 0)
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </button>
      </div>
    </div>
  );
};

export default QuizAssessmentExercise;