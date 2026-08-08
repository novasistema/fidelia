import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { Survey } from '../../types';
import { ClipboardList, Zap, CheckCircle2, Star, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SurveysView: React.FC = () => {
  const { currentCustomer, surveys, completeSurvey } = useLoyalty();
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!currentCustomer) return null;

  const handleStartSurvey = (s: Survey) => {
    setActiveSurvey(s);
    setAnswers({});
    setMessage(null);
  };

  const handleSubmitAnswers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurvey) return;

    const res = completeSurvey(activeSurvey.id, answers);
    if (res.success) {
      confetti({ particleCount: 80, spread: 60 });
      setMessage({ success: true, text: res.message });
      setTimeout(() => {
        setActiveSurvey(null);
        setMessage(null);
      }, 2500);
    } else {
      setMessage({ success: false, text: res.message });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Encuestas & Opinión</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ayudanos a mejorar respondiendo breves encuestas y sumá puntos extra de regalo.
          </p>
        </div>
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
          <ClipboardList className="w-6 h-6" />
        </div>
      </div>

      {activeSurvey ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="px-2.5 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold uppercase rounded-full">
                Ganá +{activeSurvey.rewardPoints} puntos
              </span>
              <h2 className="font-extrabold text-slate-800 text-xl mt-1">
                {activeSurvey.title}
              </h2>
            </div>
            <button
              onClick={() => setActiveSurvey(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              Cancelar
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-xs font-bold border ${
              message.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmitAnswers} className="space-y-6">
            {activeSurvey.questions.map((q, idx) => (
              <div key={q.id} className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="block text-xs font-extrabold text-slate-800">
                  {idx + 1}. {q.question}
                </label>

                {q.type === 'text' && (
                  <input
                    type="text"
                    required
                    value={answers[q.id] || ''}
                    onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                    placeholder="Escribí tu respuesta aquí..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                )}

                {q.type === 'multiple_choice' && (
                  <div className="space-y-2 pt-1">
                    {q.options?.map(opt => (
                      <label key={opt} className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          required
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                          className="text-sky-600 focus:ring-sky-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'rating' && (
                  <div className="flex items-center space-x-2 pt-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [q.id]: String(star) })}
                        className={`p-2 rounded-xl transition ${
                          Number(answers[q.id]) >= star ? 'bg-amber-400 text-white shadow-sm' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-2xl shadow-lg transition"
            >
              Enviar Encuesta y Sumar Puntos
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.filter(s => s.isActive).map(survey => {
            const isCompleted = survey.completedCustomerIds.includes(currentCustomer.id);
            return (
              <div
                key={survey.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-800 text-base">
                      {survey.title}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-black rounded-full flex items-center space-x-1">
                      <Zap className="w-3 h-3 fill-sky-600" />
                      <span>+{survey.rewardPoints} pts</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {survey.description}
                  </p>
                </div>

                {isCompleted ? (
                  <div className="flex items-center space-x-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completada</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartSurvey(survey)}
                    className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
                  >
                    <span>Responder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
