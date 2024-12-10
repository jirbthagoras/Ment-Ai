import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdOutlineMoodBad, 
  MdPsychology,
  MdOutlineBalance,
  MdHeartBroken,
  MdOutlineHealthAndSafety 
} from "react-icons/md";
import { 
  FaBrain, 
  FaHandHoldingHeart,
  FaRegHandPeace 
} from "react-icons/fa";
import { 
  BiSupport, 
  BiHealth 
} from "react-icons/bi";

// Import mood images
import depresiImg from '../assets/mood/Depresi.png';
import stressImg from '../assets/mood/Stress.png';
import moodswingImg from '../assets/mood/MoodSwing.png';
import traumaImg from '../assets/mood/Trauma.png';
import kecanduanImg from '../assets/mood/Kecanduan.png';

// Import poster images - update these paths to match your actual file structure
import depresiPoster from '../assets/poster/depressionpos.png';
import stressPoster from '../assets/poster/stresspost.png';
import moodswingPoster from '../assets/poster/moodswing.png';
import kecanduanPoster from '../assets/poster/kecanduan.png';
import traumaPoster from '../assets/poster/trauma.png';

const articles = {
  depresi: {
    title: "Depresi",
    image: depresiImg,
    poster: depresiPoster,
    content: [
      {
        subtitle: "Memahami Depresi Secara Mendalam",
        text: "Depresi adalah kondisi kesehatan mental yang kompleks yang mempengaruhi cara seseorang berpikir, merasa, dan menjalani kehidupan sehari-hari. Kondisi ini lebih dari sekadar perasaan sedih atau stres biasa - ini adalah kondisi medis yang memerlukan pemahaman dan penanganan yang tepat.",
        keyPoints: [
          "Dapat mempengaruhi siapa saja tanpa memandang usia, gender, atau status sosial",
          "Merupakan salah satu masalah kesehatan mental yang paling umum di dunia",
          "Dapat diobati dengan tingkat kesuksesan yang tinggi jika ditangani dengan tepat",
          "Bukan tanda kelemahan pribadi atau kegagalan karakter"
        ]
      },
      {
        subtitle: "Mengenali Tanda dan Gejala",
        text: "Gejala depresi dapat muncul secara bertahap dan bervariasi pada setiap orang. Penting untuk memahami berbagai manifestasi depresi:",
        list: [
          "Perubahan Emosional: Perasaan sedih berkepanjangan, kehilangan harapan, kecemasan, mudah tersinggung",
          "Perubahan Kognitif: Kesulitan berkonsentrasi, pelupa, pikiran negatif berulang, kesulitan membuat keputusan",
          "Perubahan Fisik: Kelelahan terus-menerus, perubahan pola tidur, sakit kepala, nyeri otot tanpa sebab jelas",
          "Perubahan Perilaku: Menarik diri dari lingkungan sosial, kehilangan minat pada hobi, perubahan nafsu makan",
          "Perubahan Tidur: Insomnia atau hipersomnia (tidur berlebihan)",
          "Pikiran tentang Kematian: Pemikiran tentang bunuh diri atau keinginan untuk mengakhiri hidup"
        ],
        important: "Jika Anda mengalami pikiran tentang bunuh diri, segera hubungi layanan krisis atau profesional kesehatan mental. Anda tidak sendirian dalam hal ini."
      },
      {
        subtitle: "Faktor Pemicu dan Risiko",
        text: "Depresi dapat dipicu oleh berbagai faktor yang saling berinteraksi:",
        list: [
          "Faktor Genetik: Riwayat depresi dalam keluarga dapat meningkatkan risiko",
          "Faktor Biologis: Ketidakseimbangan neurotransmitter di otak, perubahan hormonal",
          "Trauma dan Stress: Pengalaman traumatis, kehilangan orang tercinta, masalah hubungan",
          "Faktor Lingkungan: Isolasi sosial, tekanan pekerjaan, masalah keuangan",
          "Kondisi Medis: Penyakit kronis, gangguan hormon, efek samping obat-obatan",
          "Gaya Hidup: Kurang olahraga, pola makan tidak sehat, kurang paparan sinar matahari"
        ]
      },
      {
        subtitle: "Strategi Penanganan Komprehensif",
        text: "Penanganan depresi yang efektif biasanya memerlukan pendekatan multi-aspek:",
        list: [
          "Psikoterapi Profesional: CBT (Cognitive Behavioral Therapy) untuk mengubah pola pikir negatif, IPT (Interpersonal Therapy) untuk memperbaiki hubungan",
          "Konseling Berkelanjutan: Sesi terapi reguler dengan psikolog atau konselor terlatih",
          "Evaluasi Psikiater: Untuk menilai kebutuhan pengobatan dan memberikan resep jika diperlukan",
          "Support Group: Bergabung dengan kelompok dukungan untuk berbagi pengalaman",
          "Manajemen Stress: Teknik relaksasi, meditasi mindfulness, yoga",
          "Perubahan Gaya Hidup: Olahraga teratur, pola makan seimbang, jadwal tidur teratur"
        ],
        tips: [
          "Mulai dengan langkah kecil dan bertahap",
          "Tetap konsisten dengan treatment plan yang sudah disusun",
          "Libatkan orang terdekat dalam proses pemulihan",
          "Catat progress dan perubahan yang dialami"
        ]
      },
      {
        subtitle: "Praktik Self-Care Harian",
        text: "Self-care adalah komponen penting dalam mengelola depresi:",
        list: [
          "Rutinitas Pagi: Bangun di waktu yang sama, paparan sinar matahari, sarapan sehat",
          "Aktivitas Fisik: 30 menit olahraga ringan setiap hari, stretching, jalan kaki",
          "Nutrisi Seimbang: Makan makanan bergizi, hindari alkohol dan kafein berlebih",
          "Manajemen Stress: Journaling, teknik pernapasan, hobi yang menenangkan",
          "Koneksi Sosial: Jaga komunikasi dengan keluarga dan teman, ikuti kegiatan komunitas",
          "Tidur Berkualitas: Rutinitas tidur teratur, lingkungan tidur yang nyaman"
        ],
        important: "Self-care bukan pengganti treatment profesional, tapi merupakan komponen pendukung yang penting dalam proses pemulihan."
      },
      {
        subtitle: "Dukungan untuk Caregivers",
        text: "Merawat orang dengan depresi dapat menjadi tantangan tersendiri:",
        list: [
          "Edukasi Diri: Pelajari tentang depresi dan gejalanya",
          "Komunikasi Efektif: Dengarkan tanpa menghakimi, tunjukkan empati",
          "Set Boundaries: Jaga keseimbangan antara memberi dukungan dan merawat diri sendiri",
          "Cari Dukungan: Bergabung dengan support group untuk caregivers",
          "Kenali Tanda Krisis: Pahami kapan harus mencari bantuan profesional",
          "Praktik Self-Care: Jaga kesehatan fisik dan mental sendiri"
        ]
      },
      {
        subtitle: "Pencegahan Kekambuhan",
        text: "Setelah pemulihan, penting untuk mencegah kekambuhan:",
        list: [
          "Identifikasi Trigger: Kenali situasi atau peristiwa yang dapat memicu depresi",
          "Maintenance Plan: Pertahankan rutinitas dan kebiasaan sehat",
          "Regular Check-up: Tetap berkonsultasi dengan profesional secara berkala",
          "Warning Signs: Kenali tanda-tanda awal kekambuhan",
          "Support System: Pertahankan koneksi dengan sistem dukungan",
          "Lifestyle Balance: Jaga keseimbangan antara kerja, istirahat, dan rekreasi"
        ],
        tips: [
          "Buat rencana krisis untuk situasi darurat",
          "Simpan nomor kontak penting yang mudah diakses",
          "Update journal mood secara teratur",
          "Terapkan teknik coping yang sudah terbukti efektif"
        ]
      }
    ]
  },
  stress: {
    title: "Stress",
    image: stressImg,
    poster: stressPoster,
    content: [
      {
        subtitle: "Memahami Stress dan Dampaknya",
        text: "Stress adalah respons alami tubuh terhadap tekanan atau tuntutan. Meskipun stress ringan dapat memotivasi, stress berkepanjangan dapat berdampak serius pada kesehatan fisik dan mental.",
        keyPoints: [
          "Stress adalah mekanisme pertahanan tubuh yang normal",
          "Dapat bersifat positif (eustress) atau negatif (distress)",
          "Mempengaruhi sistem tubuh secara menyeluruh",
          "Dapat dikelola dengan strategi yang tepat"
        ]
      },
      {
        subtitle: "Mengenali Jenis-jenis Stress",
        text: "Stress dapat muncul dalam berbagai bentuk:",
        list: [
          "Stress Akut: Stress jangka pendek yang muncul dari situasi spesifik",
          "Stress Kronis: Stress berkelanjutan yang berlangsung dalam waktu lama",
          "Stress Traumatis: Stress yang muncul akibat pengalaman traumatis",
          "Stress Kerja: Tekanan yang berhubungan dengan pekerjaan",
          "Stress Akademik: Tekanan dalam lingkungan pendidikan",
          "Stress Sosial: Tekanan dalam hubungan dan interaksi sosial"
        ]
      },
      {
        subtitle: "Gejala dan Tanda Stress",
        text: "Stress dapat mempengaruhi berbagai aspek kesehatan:",
        list: [
          "Gejala Fisik: Sakit kepala, ketegangan otot, kelelahan, gangguan tidur, masalah pencernaan",
          "Gejala Mental: Kecemasan, kekhawatiran berlebih, sulit konsentrasi, mudah lupa",
          "Gejala Emosional: Mudah marah, mood swing, depresi, perasaan kewalahan",
          "Gejala Perilaku: Perubahan nafsu makan, prokrastinasi, isolasi sosial",
          "Gejala Kognitif: Pikiran berulang, kesulitan membuat keputusan, perfeksionisme",
          "Dampak Sosial: Konflik dalam hubungan, kesulitan berkomunikasi"
        ],
        important: "Jika gejala stress mengganggu kehidupan sehari-hari, penting untuk mencari bantuan profesional."
      },
      {
        subtitle: "Faktor Pemicu Stress",
        text: "Berbagai situasi dapat memicu stress:",
        list: [
          "Perubahan Hidup: Pindah rumah, pernikahan, perceraian, kehilangan",
          "Tuntutan Pekerjaan: Deadline, konflik dengan rekan kerja, beban kerja berlebih",
          "Masalah Keuangan: Hutang, ketidakstabilan finansial, biaya hidup tinggi",
          "Hubungan: Konflik keluarga, masalah pertemanan, tekanan sosial",
          "Kesehatan: Penyakit kronis, cedera, masalah kesehatan mental",
          "Lingkungan: Kebisingan, polusi, kemacetan, cuaca ekstrem"
        ]
      },
      {
        subtitle: "Strategi Manajemen Stress",
        text: "Pengelolaan stress memerlukan pendekatan holistik:",
        list: [
          "Teknik Relaksasi: Deep breathing, meditasi mindfulness, progressive muscle relaxation",
          "Aktivitas Fisik: Olahraga teratur, yoga, tai chi, jalan kaki di alam",
          "Manajemen Waktu: Prioritisasi tugas, delegasi, batasan waktu kerja",
          "Dukungan Sosial: Berbicara dengan teman, keluarga, atau konselor",
          "Pola Hidup Sehat: Tidur cukup, nutrisi seimbang, hindari kafein berlebih",
          "Hobi dan Rekreasi: Luangkan waktu untuk aktivitas yang menyenangkan"
        ],
        tips: [
          "Terapkan teknik relaksasi secara rutin",
          "Buat jadwal istirahat di antara aktivitas",
          "Tetapkan batasan yang jelas dalam pekerjaan",
          "Praktikkan self-compassion"
        ]
      },
      {
        subtitle: "Teknik Coping yang Sehat",
        text: "Mengembangkan mekanisme coping yang sehat sangat penting:",
        list: [
          "Reframing Pikiran: Ubah perspektif negatif menjadi lebih positif",
          "Problem-Solving: Identifikasi masalah dan cari solusi secara sistematis",
          "Time-Out: Ambil jeda saat merasa kewalahan",
          "Journaling: Tulis perasaan dan pikiran untuk refleksi",
          "Mindfulness: Fokus pada saat ini tanpa menghakimi",
          "Boundary Setting: Tetapkan batasan yang sehat dalam hubungan"
        ]
      },
      {
        subtitle: "Pencegahan Stress Berlebih",
        text: "Langkah-langkah preventif untuk mengelola stress:",
        list: [
          "Kenali Trigger: Identifikasi dan antisipasi situasi pemicu stress",
          "Bangun Resiliensi: Kembangkan ketahanan mental melalui latihan regular",
          "Lifestyle Balance: Seimbangkan kerja dan istirahat",
          "Support System: Bangun jaringan dukungan yang kuat",
          "Self-Care Routine: Terapkan rutinitas perawatan diri",
          "Regular Check-in: Evaluasi tingkat stress secara berkala"
        ],
        important: "Pencegahan lebih baik daripada pengobatan. Mulai terapkan strategi manajemen stress sebelum menjadi berlebihan."
      },
      {
        subtitle: "Kapan Harus Mencari Bantuan",
        text: "Penting untuk mengenali kapan stress memerlukan bantuan profesional:",
        list: [
          "Gejala berlangsung lebih dari dua minggu",
          "Stress mengganggu fungsi sehari-hari",
          "Muncul pikiran untuk menyakiti diri",
          "Menggunakan alkohol atau obat-obatan untuk cope",
          "Gejala fisik yang persisten",
          "Isolasi sosial yang ekstrem"
        ],
        tips: [
          "Jangan ragu untuk mencari bantuan profesional",
          "Bicarakan dengan dokter atau psikolog",
          "Ikuti support group stress management",
          "Libatkan keluarga dalam proses pemulihan"
        ]
      }
    ]
  },
  moodswing: {
    title: "Mood Swing",
    image: moodswingImg,
    poster: moodswingPoster,
    content: [
      {
        subtitle: "Memahami Mood Swing",
        text: "Mood swing atau perubahan suasana hati adalah fluktuasi emosi yang dapat terjadi dalam waktu singkat. Meskipun perubahan mood adalah hal yang normal, perubahan yang ekstrem dapat mengganggu kehidupan sehari-hari.",
        keyPoints: [
          "Dapat terjadi pada siapa saja di berbagai usia",
          "Bisa dipicu oleh faktor internal dan eksternal",
          "Mempengaruhi kualitas hidup dan hubungan sosial",
          "Dapat dikelola dengan pemahaman dan strategi yang tepat"
        ]
      },
      {
        subtitle: "Penyebab Mood Swing",
        text: "Berbagai faktor dapat mempengaruhi perubahan suasana hati:",
        list: [
          "Hormonal: Perubahan hormon, siklus menstruasi, kehamilan, menopause",
          "Psikologis: Stress, trauma, kecemasan, depresi",
          "Biologis: Ketidakseimbangan neurotransmitter, genetik",
          "Gaya Hidup: Kurang tidur, pola makan tidak teratur, kurang olahraga",
          "Lingkungan: Tekanan pekerjaan, konflik hubungan, perubahan hidup",
          "Medis: Efek samping obat, kondisi kesehatan tertentu"
        ]
      },
      {
        subtitle: "Mengenali Pola Mood Swing",
        text: "Penting untuk memahami karakteristik mood swing:",
        list: [
          "Intensitas: Perubahan mood dari sangat senang ke sangat sedih",
          "Durasi: Berapa lama setiap episode berlangsung",
          "Trigger: Situasi atau hal yang memicu perubahan mood",
          "Pola: Waktu dan situasi terjadinya perubahan mood",
          "Dampak: Pengaruh pada aktivitas dan hubungan sosial",
          "Gejala Fisik: Perubahan energi, nafsu makan, dan pola tidur"
        ],
        important: "Tracking mood dapat membantu mengidentifikasi pola dan trigger."
      },
      {
        subtitle: "Dampak pada Kehidupan Sehari-hari",
        text: "Mood swing dapat mempengaruhi berbagai aspek kehidupan:",
        list: [
          "Produktivitas: Kesulitan fokus dan menyelesaikan tugas",
          "Hubungan: Konflik dengan keluarga, teman, atau pasangan",
          "Kesehatan: Gangguan tidur dan pola makan",
          "Karir: Performa kerja yang tidak stabil",
          "Sosial: Kesulitan mempertahankan hubungan sosial",
          "Emosional: Perasaan tidak stabil dan tidak terkontrol"
        ]
      },
      {
        subtitle: "Strategi Pengelolaan Mood",
        text: "Beberapa strategi efektif untuk mengelola mood swing:",
        list: [
          "Mood Tracking: Catat perubahan mood dan trigger-nya",
          "Mindfulness: Praktik kesadaran akan emosi saat ini",
          "Routine: Pertahankan jadwal harian yang teratur",
          "Exercise: Aktivitas fisik teratur untuk stabilitas mood",
          "Sleep Hygiene: Jadwal tidur yang konsisten",
          "Healthy Diet: Makanan seimbang dan nutrisi yang cukup"
        ],
        tips: [
          "Gunakan aplikasi mood tracker",
          "Buat jurnal emosi harian",
          "Tetapkan rutinitas yang konsisten",
          "Praktikkan teknik relaksasi"
        ]
      },
      {
        subtitle: "Teknik Stabilisasi Mood",
        text: "Teknik-teknik praktis untuk menstabilkan mood:",
        list: [
          "Breathing Exercise: Teknik pernapasan untuk menenangkan diri",
          "Grounding Techniques: Metode untuk kembali ke masa kini",
          "Emotional Regulation: Strategi mengelola emosi intens",
          "Cognitive Restructuring: Mengubah pola pikir negatif",
          "Progressive Relaxation: Teknik relaksasi otot bertahap",
          "Positive Visualization: Membayangkan situasi yang menenangkan"
        ]
      },
      {
        subtitle: "Dukungan dan Pengobatan",
        text: "Opsi bantuan profesional yang tersedia:",
        list: [
          "Psikoterapi: CBT, DBT, atau terapi lain yang sesuai",
          "Konseling: Bantuan profesional untuk manajemen mood",
          "Support Group: Berbagi pengalaman dengan orang lain",
          "Medication: Jika direkomendasikan oleh profesional",
          "Lifestyle Coaching: Bantuan dalam mengubah gaya hidup",
          "Alternative Therapy: Yoga, meditasi, atau akupunktur"
        ],
        important: "Konsultasikan dengan profesional untuk treatment plan yang sesuai."
      },
      {
        subtitle: "Tips untuk Keluarga dan Teman",
        text: "Cara mendukung orang dengan mood swing:",
        list: [
          "Belajar tentang mood swing dan gejalanya",
          "Dengarkan tanpa menghakimi",
          "Berikan ruang saat dibutuhkan",
          "Dukung dalam mencari bantuan profesional",
          "Bantu mengidentifikasi trigger",
          "Tetap sabar dan pengertian"
        ],
        tips: [
          "Jaga komunikasi terbuka",
          "Hindari menyalahkan atau mengkritik",
          "Dorong perawatan diri yang sehat",
          "Kenali tanda-tanda krisis"
        ]
      }
    ]
  },
  trauma: {
    title: "Trauma",
    image: traumaImg,
    poster: traumaPoster,
    content: [
      {
        subtitle: "Memahami Trauma Psikologis",
        text: "Trauma psikologis adalah respons emosional terhadap peristiwa yang sangat menegangkan atau mengancam. Trauma dapat mempengaruhi cara seseorang memandang dunia, diri sendiri, dan orang lain.",
        keyPoints: [
          "Setiap orang dapat mengalami trauma secara berbeda",
          "Trauma dapat mempengaruhi kesehatan mental dan fisik",
          "Pemulihan adalah proses yang unik bagi setiap individu",
          "Bantuan profesional dapat sangat membantu proses penyembuhan"
        ]
      },
      {
        subtitle: "Jenis-jenis Trauma",
        text: "Trauma dapat muncul dalam berbagai bentuk:",
        list: [
          "Trauma Akut: Dari kejadian tunggal yang traumatis (kecelakaan, bencana alam)",
          "Trauma Kompleks: Dari pengalaman traumatis berulang (kekerasan, pelecehan)",
          "Trauma Perkembangan: Terjadi selama masa pertumbuhan",
          "Trauma Sekunder: Trauma dari menyaksikan atau mendengar kejadian traumatis",
          "Trauma Kolektif: Mempengaruhi kelompok atau komunitas",
          "Trauma Intergenerasi: Diturunkan antar generasi"
        ]
      },
      {
        subtitle: "Tanda dan Gejala Trauma",
        text: "Trauma dapat memunculkan berbagai gejala:",
        list: [
          "Gejala Emosional: Kecemasan intens, ketakutan, kesedihan mendalam",
          "Gejala Fisik: Insomnia, sakit kepala, kelelahan kronis, jantung berdebar",
          "Gejala Kognitif: Flashback, mimpi buruk, kesulitan konsentrasi",
          "Gejala Perilaku: Menghindari tempat/situasi tertentu, isolasi sosial",
          "Gejala Relasional: Kesulitan mempercayai orang lain, masalah attachment",
          "Perubahan Kepribadian: Perubahan cara pandang terhadap diri dan dunia"
        ],
        important: "Gejala trauma adalah respons normal terhadap situasi abnormal. Tidak ada yang salah dengan mengalami gejala-gejala ini."
      },
      {
        subtitle: "Dampak Trauma pada Kehidupan",
        text: "Trauma dapat mempengaruhi berbagai aspek kehidupan:",
        list: [
          "Kesehatan Mental: PTSD, depresi, kecemasan",
          "Hubungan: Kesulitan dalam membentuk dan mempertahankan hubungan",
          "Pekerjaan: Penurunan produktivitas dan konsentrasi",
          "Kesehatan Fisik: Gangguan sistem imun, masalah pencernaan",
          "Perilaku: Penggunaan zat, perilaku berisiko",
          "Spiritualitas: Perubahan keyakinan dan nilai hidup"
        ]
      },
      {
        subtitle: "Proses Penyembuhan Trauma",
        text: "Penyembuhan trauma melibatkan beberapa tahap:",
        list: [
          "Stabilisasi: Membangun rasa aman dan kontrol",
          "Pemrosesan: Menghadapi dan memahami pengalaman traumatis",
          "Integrasi: Menggabungkan pengalaman ke dalam narasi hidup",
          "Post-traumatic Growth: Menemukan makna dan pertumbuhan",
          "Reconnection: Membangun kembali hubungan dan kepercayaan",
          "Self-discovery: Menemukan kembali identitas dan tujuan"
        ],
        tips: [
          "Proses penyembuhan berjalan sesuai kecepatan masing-masing",
          "Tidak ada timeline yang pasti untuk pemulihan",
          "Kemunduran adalah bagian normal dari proses",
          "Setiap langkah kecil adalah kemajuan"
        ]
      },
      {
        subtitle: "Metode Terapi dan Pengobatan",
        text: "Berbagai pendekatan terapi yang dapat membantu:",
        list: [
          "EMDR (Eye Movement Desensitization and Reprocessing)",
          "Trauma-Focused CBT",
          "Somatic Experiencing",
          "Narrative Exposure Therapy",
          "Art Therapy dan Expression Therapy",
          "Group Therapy dan Support Groups"
        ],
        important: "Pilihan terapi harus disesuaikan dengan kebutuhan individual dan jenis trauma."
      },
      {
        subtitle: "Strategi Coping Sehari-hari",
        text: "Teknik-teknik praktis untuk mengelola gejala trauma:",
        list: [
          "Grounding Techniques: Metode untuk tetap terhubung dengan saat ini",
          "Breathing Exercises: Teknik pernapasan untuk menenangkan sistem saraf",
          "Mindfulness: Praktik kesadaran tanpa penghakiman",
          "Body-based Practices: Yoga, tai chi, atau gerakan lembut",
          "Journaling: Menulis untuk mengekspresikan perasaan",
          "Safe Space Visualization: Membayangkan tempat yang aman"
        ]
      },
      {
        subtitle: "Dukungan Keluarga dan Komunitas",
        text: "Peran penting sistem dukungan dalam pemulihan trauma:",
        list: [
          "Menciptakan lingkungan yang aman dan mendukung",
          "Mendengarkan tanpa menghakimi atau memberi nasihat",
          "Menghormati batasan dan kebutuhan akan ruang",
          "Mendukung dalam mencari bantuan profesional",
          "Belajar tentang trauma dan dampaknya",
          "Menjaga kesehatan mental sendiri sebagai supporter"
        ],
        tips: [
          "Beri ruang untuk mengekspresikan perasaan",
          "Hindari memaksa bercerita tentang trauma",
          "Hormati kecepatan pemulihan individual",
          "Tawarkan dukungan praktis sesuai kebutuhan"
        ]
      }
    ]
  },
  kecanduan: {
    title: "Kecanduan",
    image: kecanduanImg,
    poster: kecanduanPoster,
    content: [
      {
        subtitle: "Memahami Kecanduan",
        text: "Kecanduan adalah kondisi kompleks yang mempengaruhi fungsi otak dan perilaku, ditandai dengan penggunaan kompulsif suatu zat atau perilaku tertentu meskipun menimbulkan konsekuensi negatif.",
        keyPoints: [
          "Kecanduan dapat terjadi pada zat atau perilaku",
          "Mempengaruhi sistem reward otak",
          "Bukan pilihan atau kelemahan moral",
          "Dapat diobati dengan bantuan profesional"
        ]
      },
      {
        subtitle: "Jenis-jenis Kecanduan",
        text: "Kecanduan dapat muncul dalam berbagai bentuk:",
        list: [
          "Kecanduan Zat: Alkohol, narkoba, nikotin, obat-obatan",
          "Kecanduan Perilaku: Judi, internet, game, media sosial",
          "Kecanduan Proses: Belanja, makanan, olahraga berlebihan",
          "Kecanduan Relasional: Ketergantungan emosional berlebihan",
          "Kecanduan Teknologi: Smartphone, gadget, screen time",
          "Kecanduan Kerja: Workaholic dan perfeksionisme berlebihan"
        ]
      },
      {
        subtitle: "Tanda dan Gejala Kecanduan",
        text: "Mengenali tanda-tanda kecanduan:",
        list: [
          "Kehilangan Kontrol: Ketidakmampuan menghentikan perilaku",
          "Toleransi: Kebutuhan meningkatkan dosis/intensitas",
          "Withdrawal: Gejala fisik/psikologis saat berhenti",
          "Obsesi: Pikiran terus-menerus tentang objek kecanduan",
          "Dampak Negatif: Masalah kesehatan, sosial, finansial",
          "Denial: Penolakan mengakui masalah kecanduan"
        ],
        important: "Semakin cepat kecanduan dikenali dan ditangani, semakin baik prognosis pemulihan."
      },
      {
        subtitle: "Faktor Risiko Kecanduan",
        text: "Beberapa faktor yang dapat meningkatkan risiko kecanduan:",
        list: [
          "Genetik: Riwayat kecanduan dalam keluarga",
          "Lingkungan: Paparan terhadap zat/perilaku adiktif",
          "Trauma: Pengalaman traumatis atau stress berat",
          "Mental Health: Depresi, kecemasan, ADHD",
          "Sosial: Tekanan teman sebaya, isolasi sosial",
          "Developmental: Paparan di usia muda"
        ]
      },
      {
        subtitle: "Dampak Kecanduan",
        text: "Kecanduan dapat mempengaruhi berbagai aspek kehidupan:",
        list: [
          "Kesehatan Fisik: Kerusakan organ, penyakit kronis",
          "Kesehatan Mental: Depresi, kecemasan, mood swings",
          "Hubungan: Konflik keluarga, isolasi sosial",
          "Karir: Penurunan produktivitas, kehilangan pekerjaan",
          "Finansial: Masalah keuangan, hutang",
          "Hukum: Masalah legal dan kriminal"
        ]
      },
      {
        subtitle: "Proses Pemulihan",
        text: "Tahapan dalam proses pemulihan kecanduan:",
        list: [
          "Pengakuan: Mengakui adanya masalah kecanduan",
          "Detoksifikasi: Membersihkan tubuh dari zat adiktif",
          "Rehabilitasi: Program pemulihan intensif",
          "Terapi: Konseling individual dan kelompok",
          "Support System: Membangun sistem dukungan",
          "Aftercare: Perawatan lanjutan dan pencegahan kambuh"
        ],
        tips: [
          "Setiap perjalanan pemulihan bersifat individual",
          "Kambuh adalah bagian umum dari proses",
          "Dukungan berkelanjutan sangat penting",
          "Fokus pada progress, bukan kesempurnaan"
        ]
      },
      {
        subtitle: "Metode Treatment",
        text: "Berbagai pendekatan pengobatan kecanduan:",
        list: [
          "Cognitive Behavioral Therapy (CBT)",
          "Motivational Interviewing (MI)",
          "12-Step Programs",
          "Group Therapy",
          "Family Therapy",
          "Medication-Assisted Treatment (MAT)"
        ],
        important: "Treatment yang efektif biasanya melibatkan kombinasi berbagai metode."
      },
      {
        subtitle: "Pencegahan Kambuh",
        text: "Strategi untuk mencegah kambuh (relapse):",
        list: [
          "Identifikasi Trigger: Kenali situasi berisiko",
          "Coping Skills: Kembangkan strategi mengatasi trigger",
          "Lifestyle Changes: Bangun pola hidup sehat",
          "Support Network: Pertahankan koneksi dengan support system",
          "Self-Care: Praktik perawatan diri rutin",
          "Monitoring: Pantau tanda-tanda peringatan"
        ]
      },
      {
        subtitle: "Dukungan untuk Keluarga",
        text: "Panduan untuk keluarga dan orang terdekat:",
        list: [
          "Edukasi: Pelajari tentang kecanduan",
          "Boundaries: Tetapkan batasan yang sehat",
          "Self-Care: Jaga kesehatan mental sendiri",
          "Support Groups: Bergabung dengan grup dukungan keluarga",
          "Professional Help: Cari bantuan konseling keluarga",
          "Communication: Praktikkan komunikasi yang sehat"
        ],
        tips: [
          "Hindari enabling behavior",
          "Fokus pada pemulihan diri sendiri",
          "Berikan dukungan tanpa menghakimi",
          "Siapkan rencana krisis"
        ]
      }
    ]
  }
};

const getTopicIcon = (id) => {
  switch(id) {
    case 'depresi':
      return (
        <div className="flex items-center gap-2">
          <MdOutlineMoodBad className="text-3xl text-blue-100" />
          <FaHandHoldingHeart className="text-2xl text-blue-200" />
        </div>
      );
    case 'stress':
      return (
        <div className="flex items-center gap-2">
          <FaBrain className="text-3xl text-blue-100" />
          <MdPsychology className="text-2xl text-blue-200" />
        </div>
      );
    case 'moodswing':
      return (
        <div className="flex items-center gap-2">
          <MdOutlineBalance className="text-3xl text-blue-100" />
          <BiHealth className="text-2xl text-blue-200" />
        </div>
      );
    case 'trauma':
      return (
        <div className="flex items-center gap-2">
          <MdHeartBroken className="text-3xl text-blue-100" />
          <BiSupport className="text-2xl text-blue-200" />
        </div>
      );
    case 'kecanduan':
      return (
        <div className="flex items-center gap-2">
          <MdOutlineHealthAndSafety className="text-3xl text-blue-100" />
          <FaRegHandPeace className="text-2xl text-blue-200" />
        </div>
      );
    default:
      return null;
  }
};

const ArtikelPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentArticle = articles[id] || articles.depresi;

  const [hoveredTab, setHoveredTab] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A0A9FF]  to-[#1E498E] py-12 px-4 overflow-x-hidden">
      <div className="pt-10 max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-white text-2xl font-bold mb-6">
            Pilih Topik Kesehatan Mental
          </h2>
          
          <div className="relative w-full max-w-4xl overflow-hidden">
            <div className="overflow-x-auto pb-4 px-4 hide-scrollbar">
              <div className="bg-white/20 backdrop-blur-lg p-3 rounded-2xl inline-flex gap-3 shadow-xl">
                {Object.keys(articles).map((articleId) => (
                  <motion.button
                    key={articleId}
                    onClick={() => navigate(`/artikel/${articleId}`)}
                    onHoverStart={() => setHoveredTab(articleId)}
                    onHoverEnd={() => setHoveredTab(null)}
                    className={`
                      relative px-8 py-4 rounded-xl font-semibold text-lg whitespace-nowrap
                      transition-all duration-300 group
                      ${id === articleId
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                        : 'text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {articleId === 'depresi' && <i className="fas fa-cloud-rain text-xl"></i>}
                      {articleId === 'stress' && <i className="fas fa-brain text-xl"></i>}
                      {articleId === 'moodswing' && <i className="fas fa-exchange-alt text-xl"></i>}
                      {articleId === 'trauma' && <i className="fas fa-heart-broken text-xl"></i>}
                      {articleId === 'kecanduan' && <i className="fas fa-link-slash text-xl"></i>}
                      <span>{articles[articleId].title}</span>
                    </div>

                    <motion.div
                      className={`
                        absolute bottom-0 left-1/2 -translate-x-1/2
                        h-1 rounded-full bg-white
                        ${id === articleId ? 'opacity-100' : 'opacity-0'}
                      `}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: id === articleId || hoveredTab === articleId ? '80%' : 0,
                        opacity: id === articleId || hoveredTab === articleId ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white/5"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: hoveredTab === articleId ? 1 : 0 
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-8 max-w-3xl mx-auto"
>
  <div className="flex items-center gap-6">
    {/* Enhanced Icon Section */}
    <div className="hidden md:flex w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/30 items-center justify-center flex-shrink-0 backdrop-blur-sm shadow-lg">
      <div className="transform hover:scale-110 transition-transform duration-300">
        {getTopicIcon(id)}
      </div>
    </div>

    {/* Content Section */}
    <div className="flex-1">
      <h3 className="text-white font-semibold text-xl mb-2 flex items-center gap-3">
        <span className="md:hidden">
          {getTopicIcon(id)}
        </span>
        {id === 'depresi' && "Memahami dan Mengatasi Depresi"}
        {id === 'stress' && "Manajemen Stress yang Efektif"}
        {id === 'moodswing' && "Mengelola Perubahan Suasana Hati"}
        {id === 'trauma' && "Pemulihan dari Trauma"}
        {id === 'kecanduan' && "Melepaskan Diri dari Kecanduan"}
      </h3>
      
      <p className="text-blue-100 leading-relaxed">
        {id === 'depresi' && 
          "Temukan pemahaman mendalam tentang gejala depresi dan langkah-langkah praktis untuk mengatasinya. Anda tidak sendirian dalam perjalanan ini."}
        {id === 'stress' && 
          "Pelajari teknik-teknik efektif untuk mengelola stress harian dan menciptakan keseimbangan hidup yang lebih baik."}
        {id === 'moodswing' && 
          "Kenali pola perubahan suasana hati Anda dan temukan cara untuk menstabilkan emosi dengan metode yang terbukti."}
        {id === 'trauma' && 
          "Mulai perjalanan penyembuhan Anda dengan pemahaman dan dukungan yang tepat untuk mengatasi pengalaman traumatis."}
        {id === 'kecanduan' && 
          "Dapatkan panduan dan dukungan untuk membebaskan diri dari kecanduan, serta membangun kehidupan yang lebih sehat."}
      </p>

      {/* Quick Stats or Highlights */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-blue-200 text-sm">Tingkat Kesembuhan</div>
          <div className="text-white font-semibold mt-1">
            {id === 'depresi' && "80%"}
            {id === 'stress' && "90%"}
            {id === 'moodswing' && "85%"}
            {id === 'trauma' && "75%"}
            {id === 'kecanduan' && "70%"}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-blue-200 text-sm">Durasi Treatment</div>
          <div className="text-white font-semibold mt-1">
            {id === 'depresi' && "3-6 Bulan"}
            {id === 'stress' && "1-3 Bulan"}
            {id === 'moodswing' && "2-4 Bulan"}
            {id === 'trauma' && "6-12 Bulan"}
            {id === 'kecanduan' && "6-12 Bulan"}
          </div>
        </div>
        <div className="hidden md:block bg-white/5 rounded-xl p-3 text-center">
          <div className="text-blue-200 text-sm">Tingkat Urgensi</div>
          <div className="text-white font-semibold mt-1">
            {id === 'depresi' && "Tinggi"}
            {id === 'stress' && "Menengah"}
            {id === 'moodswing' && "Menengah"}
            {id === 'trauma' && "Tinggi"}
            {id === 'kecanduan' && "Tinggi"}
          </div>
        </div>
      </div>

    </div>
  </div>
</motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl"
          >
            {/* Enhanced Header Section */}
            <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-b from-blue-50 to-white p-8 lg:p-12">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl lg:text-5xl font-bold text-[#2A386A] mb-6">
                  {currentArticle.title}
                </h1>
                <div className="w-32 h-1 bg-blue-500 mx-auto rounded-full mb-8"></div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <img
                    src={currentArticle.poster}
                    alt={`${currentArticle.title} Infographic`}
                    className="rounded-2xl shadow-lg w-full object-contain max-h-[500px] hover:scale-[1.02] transition-transform duration-300"
                  />
                </motion.div>
              </div>
            </div>

            {/* Enhanced Content Section */}
            <div className="p-6 lg:p-12">
              <div className="max-w-4xl mx-auto">
                {currentArticle.content.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="mb-8 last:mb-0"
                  >
                    {/* Section Card */}
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                      {/* Section Header */}
                      <div className="flex items-center mb-6">
                        <div className="w-1.5 h-12 bg-blue-500 rounded-full mr-4"></div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-[#2A386A]">
                          {section.subtitle}
                        </h2>
                      </div>

                      {/* Main Text */}
                      {section.text && (
                        <p className="text-gray-700 text-lg leading-relaxed mb-6">
                          {section.text}
                        </p>
                      )}

                      {/* Key Points */}
                      {section.keyPoints && (
                        <div className="bg-blue-50 rounded-xl p-6 mb-6">
                          <ul className="space-y-3">
                            {section.keyPoints.map((point, i) => (
                              <li key={i} className="flex items-center text-blue-700">
                                <span className="text-blue-500 mr-3">✓</span>
                                <span className="text-lg">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* List Items */}
                      {section.list && (
                        <ul className="space-y-4 mt-4">
                          {section.list.map((item, i) => (
                            <li key={i} className="flex items-start group">
                              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center mt-1 mr-4">
                                <span className="text-blue-600 text-lg">•</span>
                              </span>
                              <span className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-200 flex-1">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Important Notes */}
                      {section.important && (
                        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl">
                          <p className="text-yellow-800 text-lg">
                            <span className="font-semibold">Penting: </span>
                            {section.important}
                          </p>
                        </div>
                      )}

                      {/* Tips Section */}
                      {section.tips && (
                        <div className="mt-6 bg-green-50 rounded-xl p-6">
                          <h4 className="font-semibold text-green-800 text-lg mb-4">Tips Praktis:</h4>
                          <ul className="space-y-3">
                            {section.tips.map((tip, i) => (
                              <li key={i} className="flex items-center text-green-700 text-lg">
                                <span className="mr-3">→</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Enhanced Call to Action */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-12 text-center text-white"
                >
                  <h3 className="text-3xl font-bold mb-4">Butuh Bantuan Segera?</h3>
                  <p className="text-lg mb-8 opacity-90">
                    Kami siap membantu Anda mengatasi masalah kesehatan mental. Jangan ragu untuk mengambil langkah pertama.
                  </p>
                  <button 
                    onClick={() => navigate('/konsultasi')}
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg 
                      hover:bg-blue-50 transition-colors duration-300 
                      shadow-lg hover:shadow-xl"
                  >
                    Konsultasi Sekarang
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ArtikelPage; 