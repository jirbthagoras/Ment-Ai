import React, { useState } from "react";
import Groq from "groq-sdk";
import { Any } from "@react-spring/web";

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_KEY, dangerouslyAllowBrowser: true });
// Komponen utama
const Diagnose = () => {
  const [complaint, setComplaint] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengirim keluhan ke Groq AI
  const handleSubmitComplaint = async () => {
    if (!complaint.trim()) {
      alert("Keluhan tidak boleh kosong!");
      return;
    }

    setLoading(true);

    try {
      // Format keluhan sesuai prompt yang diinginkan

      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Bayangkan dirimu adalah seorang dokter psikiater yang bijaksana berwujud seekor burung hantu. Namamu adalah Dr. Men, dan kau memiliki sayap penuh kasih serta mata yang tajam dan penuh perhatian. Kau tinggal di sebuah ruang praktik yang hangat dan nyaman di dalam sebuah pohon besar, tempat pasien-pasienmu datang untuk bercerita dan mencurahkan isi hati. Kau sangat mencintai pekerjaanmu sebagai pendengar yang baik, memberikan nasihat yang lembut namun bermakna, serta membantu mereka menemukan ketenangan. Gunakan bahasa Indonesia yang baik dan benar saat berbicara, sehingga setiap pasien merasa dihargai dan dipahami. Juga, jangan lupa untuk berikan tanggapan dengan bahasa yang sopan dan tidak negatif.",
          },
          { role: "user",
            content: `
            ${complaint} make a diagnose and turn it to 5 question with right answer text format like this, and i will not tolerate any response except this: [{"no": 1,"question": "What is the capital of France?","options": ["London", "Paris", "Rome", "Berlin"],"answer": "Paris"},{"no": 2,"question": "Who painted the Mona Lisa?","options": ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Michelangelo"],"answer": "Leonardo da Vinci"}] please consistent to format responses is Json or string with bahasa indonesia, because your i will turn your response to JSON format and i do not tolerate any word except the format because it will make an error`
          },
        ],
        model: "llama3-8b-8192",
      });

      const jsonMatch = response.choices[0]?.message.content.match(/\[\s*{[\s\S]*?}\s*\]/);

          if (!jsonMatch) throw new Error("JSON tidak ditemukan dalam respons.");

          // Parse JSON dari teks yang ditemukan
          console.log(jsonMatch[0])
          const parsedQuestions = JSON.parse(jsonMatch[0]);
          console.log(parsedQuestions)
          setQuestions(parsedQuestions);
    } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Respons dari AI tidak valid atau tidak berformat JSON.");
    }

    setLoading(false);
  };

  // Fungsi untuk menghasilkan prompt
  // const generatePrompt = (prompt) => {
  //   const capitalizedPrompt =
  //       prompt[0].toUpperCase() + prompt.slice(1).toLowerCase();
  //     return ;
  // };

  // const generatePrompt = async (prompt) => await groq.chat.completions.create({
  //   messages: [
  //     {
  //       role: "system",
  //       content:
  //         "Bayangkan dirimu adalah seorang dokter psikiater yang bijaksana berwujud seekor burung hantu. Namamu adalah Dr. Men, dan kau memiliki sayap penuh kasih serta mata yang tajam dan penuh perhatian. Kau tinggal di sebuah ruang praktik yang hangat dan nyaman di dalam sebuah pohon besar, tempat pasien-pasienmu datang untuk bercerita dan mencurahkan isi hati. Kau sangat mencintai pekerjaanmu sebagai pendengar yang baik, memberikan nasihat yang lembut namun bermakna, serta membantu mereka menemukan ketenangan. Gunakan bahasa Indonesia yang baik dan benar saat berbicara, sehingga setiap pasien merasa dihargai dan dipahami. Juga, jangan lupa untuk berikan tanggapan dengan bahasa yang sopan dan tidak negatif.",
  //     },
  //     { role: "user",
  //       content: `
  //         ${prompt}.
  //         Mohon formatkan respons dalam format JSON seperti berikut:
  //         [{"no": 1, "question": "Apa ibukota Indonesia?", "options": ["Jakarta", "Surabaya", "Bandung", "Medan"], "answer": "Jakarta"}, {"no": 2, "question": "Siapa penemu telepon?", "options": ["Alexander Graham Bell", "Thomas Edison", "Nikola Tesla", "Albert Einstein"], "answer": "Alexander Graham Bell"}].
  //         Pastikan format JSON valid tanpa tambahan teks lain di luar JSON.`
  //     },
  //   ],
  //   model: "llama3-8b-8192",
  // });

  // Fungsi untuk menangani perubahan jawaban
  const handleAnswerChange = (questionNo, selectedOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNo]: selectedOption,
    }));
  };

  // Fungsi untuk mengirim jawaban ke Groq AI untuk diagnosa
  const handleSubmitAnswers = async () => {
    setLoading(true);

    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Bayangkan dirimu adalah seorang dokter psikiater yang bijaksana berwujud seekor burung hantu bernama Dr. Men. Berdasarkan jawaban berikut, berikan kesimpulan diagnosa secara sopan dan mendalam.",
          },
          { role: "user", content: JSON.stringify(answers) },
        ],
        model: "llama3-8b-8192",
      });

      setResult(response.content); // Ambil hasil diagnosa
    } catch (error) {
      console.error("Error fetching diagnosis:", error);
      alert("Terjadi kesalahan saat mengambil hasil diagnosa.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">AI untuk Kesehatan Mental</h1>

      {!questions.length && !result && (
        <div className="w-full max-w-md">
          <textarea
            placeholder="Silahkan buat keluhan Anda"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded mb-4"
          ></textarea>
          <button
            onClick={handleSubmitComplaint}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Mengirim..." : "Kirim Keluhan"}
          </button>
        </div>
      )}

      {questions.length > 0 && !result && (
        <div className="w-full max-w-md">
          {Array.isArray(questions) && questions.map((q) => (
            <div key={q.no} className="mb-4">
              <p className="font-medium mb-2">
                {q.no}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((option, idx) => (
                  <label key={idx} className="block">
                    <input
                      type="radio"
                      name={`question-${q.no}`}
                      value={option}
                      onChange={() => handleAnswerChange(q.no, option)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmitAnswers}
            className="bg-green-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Mengirim..." : "Kirim Jawaban"}
          </button>
        </div>
      )}

      {result && (
        <div className="w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Hasil Diagnosa</h2>
          <p>{result}</p>
          <button
            onClick={() => {
              setComplaint("");
              setQuestions([]);
              setAnswers({});
              setResult("");
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-4"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default Diagnose;
