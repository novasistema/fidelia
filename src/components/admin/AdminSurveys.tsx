import React, { useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { ClipboardList, Plus, CheckCircle, Zap, Trash2 } from 'lucide-react';
import { SurveyQuestion } from '../../types';

const DEFAULT_QUESTIONS: SurveyQuestion[] = [
  { id: 'q1', question: '¿Cómo calificarías la atención recibida?', type: 'rating' },
  { id: 'q2', question: '¿Qué producto o servicio te gustaría que incorporemos?', type: 'text' },
  { id: 'q3', question: '¿Con qué frecuencia nos visitás?', type: 'multiple_choice', options: ['Varias veces por semana', 'Una vez por semana', 'Ocasionalmente'] }
];

export const AdminSurveys: React.FC = () => {
  const { surveys, createSurvey, toggleSurvey } = useLoyalty();
  const [questions, setQuestions] = useState<SurveyQuestion[]>(DEFAULT_QUESTIONS);
  const [saving, setSaving] = useState(false);
  const updateQ = (i: number, patch: Partial<SurveyQuestion>) => setQuestions(qs => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardPoints, setRewardPoints] = useState(200);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const clean = questions
      .filter(q => q.question.trim())
      .map((q, i) => ({ ...q, id: `q${i + 1}`, ...(q.type === 'multiple_choice' ? { options: (q.options || []).map(o => o.trim()).filter(Boolean) } : { options: undefined }) }));
    if (!clean.length) {
      alert('Agregá al menos una pregunta.');
      return;
    }
    if (clean.some(q => q.type === 'multiple_choice' && (q.options || []).length < 2)) {
      alert('Las preguntas de opción múltiple necesitan al menos 2 opciones.');
      return;
    }
    setSaving(true);
    try {
      await createSurvey({ title, description, rewardPoints, isActive: true, questions: clean });
    } catch (err: any) {
      alert(err?.message || 'No se pudo crear la encuesta.');
      return;
    } finally {
      setSaving(false);
    }

    setTitle('');
    setDescription('');
    setQuestions(DEFAULT_QUESTIONS);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-[10px] uppercase rounded-full border border-sky-100">
            Insights de Consumo
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-1">
            Gestión de Encuestas
          </h1>
          <p className="text-xs text-slate-500">
            Crea encuestas ilimitadas que recompensan a tus clientes con puntos al completarlas.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Encuesta</span>
        </button>
      </div>

      <div className="space-y-4">
        {surveys.map(survey => (
          <div key={survey.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-black rounded-full inline-flex items-center space-x-1">
                  <Zap className="w-3 h-3 fill-sky-600" />
                  <span>Recompensa: {survey.rewardPoints} pts</span>
                </span>
                <h3 className="font-extrabold text-slate-800 text-base">
                  {survey.title}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {(survey.completedCustomerIds || []).length} clientes respondieron
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {survey.description}
            </p>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
              <span>{survey.questions.length} preguntas · {survey.isActive ? 'Visible para clientes' : 'Pausada'}</span>
              <button
                onClick={() => toggleSurvey(survey.id, !survey.isActive).catch(err => alert(err?.message || 'Error'))}
                className={`px-3 py-1 rounded-lg font-bold ${survey.isActive ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}
              >
                {survey.isActive ? 'Pausar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-slate-800 text-lg">
              Nueva Encuesta de Opinión
            </h3>

            <form onSubmit={handleCreateSurvey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título de la Encuesta *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ej. ¿Cómo fue tu experiencia en el local?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Respondé 3 breves preguntas y sumá puntos gratis."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Puntos de Recompensa</label>
                <input
                  type="number"
                  value={rewardPoints}
                  onChange={e => setRewardPoints(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Preguntas</label>
                {questions.map((q, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={q.question}
                        onChange={e => updateQ(i, { question: e.target.value })}
                        placeholder={`Pregunta ${i + 1}`}
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button type="button" onClick={() => setQuestions(qs => qs.filter((_, j) => j !== i))} className="text-slate-400 hover:text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <select
                      value={q.type}
                      onChange={e => updateQ(i, { type: e.target.value as SurveyQuestion['type'] })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="rating">Calificación con estrellas</option>
                      <option value="text">Respuesta libre</option>
                      <option value="multiple_choice">Opción múltiple</option>
                    </select>
                    {q.type === 'multiple_choice' && (
                      <input
                        value={(q.options || []).join(', ')}
                        onChange={e => updateQ(i, { options: e.target.value.split(',') })}
                        placeholder="Opciones separadas por coma"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    )}
                  </div>
                ))}
                {questions.length < 15 && (
                  <button
                    type="button"
                    onClick={() => setQuestions(qs => [...qs, { id: `q${qs.length + 1}`, question: '', type: 'text' }])}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    + Agregar pregunta
                  </button>
                )}
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-sky-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  {saving ? 'Creando...' : 'Crear Encuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
