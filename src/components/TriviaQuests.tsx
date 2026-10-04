import React, { useState } from 'react';
import { CheckCircle2, Gift, HelpCircle, Trophy, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { DailyQuest, TriviaQuestion } from '../types/game';
import { TRIVIA_QUESTIONS } from '../data/initialLeagueData';
import { soundManager } from '../utils/audio';

interface TriviaQuestsProps {
  quests: DailyQuest[];
  onClaimQuestReward: (questId: string, coins: number) => void;
  onTriviaAnswered: (isCorrect: boolean, reward: number) => void;
}

export const TriviaQuests: React.FC<TriviaQuestsProps> = ({
  quests,
  onClaimQuestReward,
  onTriviaAnswered
}) => {
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [completedTriviaIds, setCompletedTriviaIds] = useState<string[]>([]);

  const currentQuestion = TRIVIA_QUESTIONS[currentQIndex];
  const isQuestionAlreadyDone = completedTriviaIds.includes(currentQuestion.id);

  const handleSelectAnswer = (index: number) => {
    if (isAnswered || isQuestionAlreadyDone) return;
    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      soundManager.playLevelUp();
      setCompletedTriviaIds((prev) => [...prev, currentQuestion.id]);
      onTriviaAnswered(true, currentQuestion.reward);
    } else {
      soundManager.playCoin();
      onTriviaAnswered(false, 0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setCurrentQIndex((prev) => (prev + 1) % TRIVIA_QUESTIONS.length);
  };

  return (
    <div className="space-y-8">
      {/* Daily Quests Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Gift className="w-4 h-4" />
              <span>Daily Fan Operations</span>
            </div>
            <h3 className="text-xl font-black text-white font-display">
              Fan Missions & Bounty Rewards
            </h3>
          </div>
          <span className="text-xs text-slate-400">Resets daily at 00:00 UTC</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((quest) => {
            const isFinished = quest.progress >= quest.maxProgress;
            const percent = Math.min(100, Math.round((quest.progress / quest.maxProgress) * 100));

            return (
              <div
                key={quest.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm">{quest.title}</h4>
                    <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
                      +${quest.rewardCoins.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{quest.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>Progress: {quest.progress}/{quest.maxProgress}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-200"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {quest.claimed ? (
                    <div className="w-full py-1.5 text-center text-xs font-semibold text-slate-500 bg-slate-900 rounded-lg">
                      Reward Claimed ✓
                    </div>
                  ) : isFinished ? (
                    <button
                      onClick={() => {
                        onClaimQuestReward(quest.id, quest.rewardCoins);
                        soundManager.playLevelUp();
                      }}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim +${quest.rewardCoins} Reward</span>
                    </button>
                  ) : (
                    <div className="w-full py-1.5 text-center text-xs font-medium text-slate-500 bg-slate-900/50 rounded-lg">
                      In Progress...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Esports Strategy Trivia Deck */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Championship Strategy Quiz</span>
            </div>
            <h3 className="text-xl font-black text-white font-display">
              Fan Dynasty Knowledge Arena
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400 font-bold">
            Question {currentQIndex + 1} of {TRIVIA_QUESTIONS.length}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="text-sm md:text-base font-bold text-white">
            {currentQuestion.question}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let btnClass = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700';

              if (isAnswered) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                } else if (isSelected) {
                  btnClass = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={isAnswered}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${btnClass}`}
                >
                  <span className="font-mono text-slate-400 mr-2">[{idx + 1}]</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation & Next */}
          {isAnswered && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                {selectedOption === currentQuestion.correctIndex ? (
                  <span className="text-emerald-400 font-bold mr-1">Correct! +${currentQuestion.reward} coins awarded!</span>
                ) : (
                  <span className="text-rose-400 font-bold mr-1">Incorrect.</span>
                )}
                <span>{currentQuestion.explanation}</span>
              </div>

              <button
                onClick={handleNextQuestion}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
