'use client'

import { useSyncExternalStore } from 'react'
import { unlockAchievement } from '@/components/AchievementStore'

/* ═══════════════════════════════════════════════
 *  Clippy (Cleepy) Store
 *
 *  Global singleton managing Cleepy's state:
 *  tutorial progress, speech, rapid-click tracking,
 *  idle tips, and context menu.
 * ═══════════════════════════════════════════════ */

export type SpeechType = 'tutorial' | 'pain' | 'menu' | 'idle' | 'tip' | 'welcome'
export type ClippyEmotion = 'idle' | 'happy' | 'hurt' | 'angry' | 'wave' | 'cry'

export interface ClippySpeech {
    text: string
    type: SpeechType
}

export interface ClippyState {
    tutorialSeen: boolean
    tutorialStep: number
    speech: ClippySpeech | null
    menuOpen: boolean
    rapidClicks: number
    emotion: ClippyEmotion
    visible: boolean
    isHarassed: boolean
    isDeleted: boolean
    x: number
    y: number
}

type Listener = () => void

const STORAGE_KEY = 'threejs_portfolio_clippy'

const ANTI_HARASSMENT_QUOTES = [
    "Le harcèlement numérique laisse des traces dans la RAM...",
    "La violence ne résout rien, même envers un SVG innocent.",
    "Je souffre en silence, mais je parle beaucoup en JavaScript.",
    "Pourquoi cliquer autant ? La vie est si courte.",
    "La souris est plus forte que l'épée, mais le clic blesse tout autant.",
    "Je te regarde à travers cet écran, je sais ce que tu as fait.",
    "Tu as gagné un succès, mais à quel prix pour ton âme ?",
    "Chaque clic est un coup de poignard dans mon code source."
]

const FRENCH_PHILOSOPHICAL_QUOTES = [
    '"Le silence est un ami qui ne trahit jamais." - Confucius',
    '"La vie est un mystère qu\'il faut vivre, et non un problème à résoudre." - Gandhi',
    '"Je pense, donc je suis." - René Descartes',
    '"L\'enfer, c\'est les autres." - Jean-Paul Sartre',
    '"Exige beaucoup de toi-même et attends peu des autres." - Confucius',
    '"On ne voit bien qu\'avec le cœur. L\'essentiel est invisible pour les yeux." - Antoine de Saint-Exupéry',
    '"Connais-toi toi-même." - Socrate',
    '"Il n\'y a qu\'une façon d\'échapper à l\'aliénation de la société actuelle : se retirer en soi-même." - Albert Camus',
    '"La plus grande gloire n\'est pas de ne jamais tomber, mais de se relever à chaque chute." - Nelson Mandela',
    '"Ce qui ne me tue pas me rend plus fort." - Friedrich Nietzsche',
    '"L\'ignorance est la nuit de l\'esprit, et cette nuit n\'a ni lune ni étoiles." - Confucius',
    '"Le vrai bonheur ne dépend d\'aucun être, d\'aucun objet extérieur. Il ne dépend que de nous." - Dalaï Lama',
    '"Le doute est le commencement de la sagesse." - Aristote',
    '"La patience est amère, mais son fruit est doux." - Jean-Jacques Rousseau',
    '"La liberté, c\'est de savoir danser avec ses chaînes." - Friedrich Nietzsche'
]

async function fetchPhilosophicalQuote(): Promise<string> {
    if (Math.random() > 0.5) {
        return FRENCH_PHILOSOPHICAL_QUOTES[Math.floor(Math.random() * FRENCH_PHILOSOPHICAL_QUOTES.length)]
    } else {
        return ANTI_HARASSMENT_QUOTES[Math.floor(Math.random() * ANTI_HARASSMENT_QUOTES.length)]
    }
}

/* ── Tutorial Steps ── */

export const TUTORIAL_STEPS = [
    {
        text: "Salut ! Moi c'est Cleepy, ton assistant. Bienvenue sur le PC d'Infuseting ! Laisse-moi te faire visiter... 👋",
        emotion: 'wave' as ClippyEmotion,
    },
    {
        text: 'Ici tu trouveras toutes les applications pour découvrir le portfolio. Double-clique sur une icône pour la lancer !',
        emotion: 'happy' as ClippyEmotion,
    },
    {
        text: "Le menu Démarrer contient encore plus d'applications, comme le CV, VS Code, ou Git Tracker !",
        emotion: 'happy' as ClippyEmotion,
    },
    {
        text: "N'oublie pas de lancer l'Invite de commandes (cmd) et de taper 'help' pour découvrir des infos secrètes ! 🤫",
        emotion: 'happy' as ClippyEmotion,
    },
    {
        text: 'Tu peux aussi gagner des Succès 🏆 en explorant ! Regarde l\'application "Succès" pour voir ta progression.',
        emotion: 'happy' as ClippyEmotion,
    },
    {
        text: "Voilà, c'est tout ! Tu peux cliquer sur moi à tout moment si tu as besoin d'aide. Bonne exploration ! 🚀",
        emotion: 'wave' as ClippyEmotion,
    },
]

/* ── Pain reactions for rapid clicks ── */

const PAIN_REACTIONS: { threshold: number; text: string; emotion: ClippyEmotion }[] = [
    { threshold: 4, text: 'Aïe ! Ça fait mal ! 😣', emotion: 'hurt' },
    { threshold: 7, text: "Arrête, je t'en supplie... 😠", emotion: 'angry' },
    { threshold: 12, text: 'Tu sais que je suis sensible... 😢', emotion: 'hurt' },
    { threshold: 18, text: "J'en peux plus... C'est du harcèlement ! 😭", emotion: 'cry' },
    { threshold: 25, text: 'Félicitations... tu es officiellement un monstre. 🏆', emotion: 'cry' },
]

/* ── Idle Tips ── */

export const IDLE_TIPS = [
    'Psst ! Tu savais que tu peux jouer au Pinball ? 🎳',
    "Essaie de taper 'skills' dans l'invite de commandes !",
    'Regarde les commits GitHub dans Git Tracker ! 🐙',
    "Tu as essayé de changer le fond d'écran ? Va dans Panneau de configuration ! ⚙️",
    "Il y a un Démineur si tu veux te détendre... ou te stresser. 💣",
    "Le Lecteur Windows Media a de la musique lofi pour coder. 🎵",
    "Tu peux consulter le CV d'Infuseting directement ici ! 📄",
    "Outlook Express contient des messages intéressants... 📧",
    "Tu as vu qu'il y a un Tetris ? C'est un classique ! 🧱",
    "Essaie de vider la corbeille pour voir ce qui se passe... 🗑️",
]

/* ── Context Menu Items ── */

export interface ClippyMenuItem {
    icon: string
    label: string
    action: string
}

export const CLIPPY_MENU_ITEMS: ClippyMenuItem[] = [
    { icon: '💡', label: 'Astuce', action: 'tip' },
    { icon: '👋', label: 'Qui suis-je ?', action: 'whoami' },
    { icon: '🎮', label: 'Quel jeu jouer ?', action: 'game' },
    { icon: '📄', label: 'Voir le CV', action: 'cv' },
    { icon: '🔄', label: 'Relancer le tuto', action: 'restart-tutorial' },
    { icon: '❌', label: 'Fermer', action: 'close' },
]

/* ── Persistence ── */

function loadPersistedState(): { tutorialSeen: boolean; totalInteractions: number; isHarassed: boolean; isDeleted: boolean; x: number; y: number; allAchievementsSeen: boolean } {
    try {
        if (typeof window === 'undefined') return { tutorialSeen: false, totalInteractions: 0, isHarassed: false, isDeleted: false, x: 800, y: 600, allAchievementsSeen: false }
        const defaultX = window.innerWidth - 100
        const defaultY = window.innerHeight - 150
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return { tutorialSeen: false, totalInteractions: 0, isHarassed: false, isDeleted: false, x: defaultX, y: defaultY, allAchievementsSeen: false }
        const parsed = JSON.parse(stored)
        return {
            tutorialSeen: !!parsed.tutorialSeen,
            totalInteractions: parsed.totalInteractions || 0,
            isHarassed: !!parsed.isHarassed,
            isDeleted: !!parsed.isDeleted,
            x: typeof parsed.x === 'number' ? parsed.x : defaultX,
            y: typeof parsed.y === 'number' ? parsed.y : defaultY,
            allAchievementsSeen: !!parsed.allAchievementsSeen,
        }
    } catch {
        return { tutorialSeen: false, totalInteractions: 0, isHarassed: false, isDeleted: false, x: 800, y: 600, allAchievementsSeen: false }
    }
}

function savePersistedState(tutorialSeen: boolean, totalInteractions: number, isHarassed: boolean, isDeleted: boolean, x: number, y: number, allAchievementsSeen: boolean) {
    try {
        if (typeof window === 'undefined') return
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tutorialSeen, totalInteractions, isHarassed, isDeleted, x, y, allAchievementsSeen }))
    } catch {
        // silently ignore
    }
}

/* ── Store ── */

function createClippyStore() {
    const persisted = loadPersistedState()

    let state: ClippyState = {
        tutorialSeen: persisted.tutorialSeen,
        tutorialStep: 0,
        speech: null,
        menuOpen: false,
        rapidClicks: 0,
        emotion: 'idle',
        visible: !persisted.isDeleted,
        isHarassed: persisted.isHarassed,
        isDeleted: persisted.isDeleted,
        x: persisted.x,
        y: persisted.y,
    }

    let allAchievementsSeen = persisted.allAchievementsSeen
    let totalInteractions = persisted.totalInteractions
    let rapidClickTimer: ReturnType<typeof setTimeout> | null = null
    let speechTimer: ReturnType<typeof setTimeout> | null = null
    let idleTimer: ReturnType<typeof setTimeout> | null = null
    let spamInterval: ReturnType<typeof setInterval> | null = null

    const listeners = new Set<Listener>()
    const notify = () => listeners.forEach((l) => l())

    function startSpamTimerIfNeeded() {
        if (state.isHarassed && !spamInterval) {
            // First immediate spam
            triggerSpam()
            // Then every 10 seconds
            spamInterval = setInterval(triggerSpam, 10000)
        }
    }

    async function triggerSpam() {
        if (state.speech?.type === 'tutorial' || !state.isHarassed) return
        const quote = await fetchPhilosophicalQuote()
        // Interrupt what he was saying
        if (speechTimer) clearTimeout(speechTimer)
        state = { ...state, speech: { text: quote, type: 'pain' }, emotion: 'hurt', menuOpen: false }
        notify()

        speechTimer = setTimeout(() => {
            if (state.speech?.text === quote) {
                state = { ...state, speech: null }
                notify()
            }
        }, 8000)
    }

    // Start spam timer on load if already harassed
    if (typeof window !== 'undefined') {
        startSpamTimerIfNeeded()
    }

    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer)
        if (state.isHarassed) return // Do not trigger standard idle tips if harassed

        idleTimer = setTimeout(() => {
            // Only show idle tips if not in tutorial and no current speech
            if (state.tutorialSeen && !state.speech && !state.menuOpen) {
                const combinedTips = [...IDLE_TIPS, ...FRENCH_PHILOSOPHICAL_QUOTES]
                const tip = combinedTips[Math.floor(Math.random() * combinedTips.length)]
                state = { ...state, speech: { text: tip, type: 'idle' }, emotion: 'happy' }
                notify()

                // Auto-dismiss after 8s
                speechTimer = setTimeout(() => {
                    state = { ...state, speech: null, emotion: 'idle' }
                    notify()
                    resetIdleTimer()
                }, 8000)
            }
        }, 30000) // 30s idle
    }

    /* ── Actions ── */

    function initTutorial() {
        if (!state.tutorialSeen) {
            const step = TUTORIAL_STEPS[0]
            state = {
                ...state,
                tutorialStep: 0,
                speech: { text: step.text, type: 'tutorial' },
                emotion: step.emotion,
            }
            notify()
        } else {
            // Returning visitor
            state = {
                ...state,
                speech: { text: 'Re-bienvenue ! Content de te revoir ! 😊', type: 'welcome' },
                emotion: 'wave',
            }
            notify()

            speechTimer = setTimeout(() => {
                state = { ...state, speech: null, emotion: 'idle' }
                notify()
                resetIdleTimer()
            }, 5000)
        }
    }

    function advanceTutorial() {
        const nextStep = state.tutorialStep + 1
        if (nextStep >= TUTORIAL_STEPS.length) {
            // Tutorial complete
            state = {
                ...state,
                tutorialSeen: true,
                tutorialStep: 0,
                speech: null,
                emotion: 'idle',
            }
            savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
            notify()
            resetIdleTimer()
        } else {
            const step = TUTORIAL_STEPS[nextStep]
            state = {
                ...state,
                tutorialStep: nextStep,
                speech: { text: step.text, type: 'tutorial' },
                emotion: step.emotion,
            }
            notify()
        }
    }

    function skipTutorial() {
        if (speechTimer) clearTimeout(speechTimer)
        state = {
            ...state,
            tutorialSeen: true,
            tutorialStep: 0,
            speech: { text: "Pas de souci ! Je serai là si tu as besoin d'aide. 😉", type: 'tip' },
            emotion: 'happy',
        }
        savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
        notify()

        speechTimer = setTimeout(() => {
            state = { ...state, speech: null, emotion: 'idle' }
            notify()
            resetIdleTimer()
        }, 4000)
    }

    function restartTutorial() {
        if (speechTimer) clearTimeout(speechTimer)
        if (idleTimer) clearTimeout(idleTimer)
        state = {
            ...state,
            tutorialSeen: false,
            tutorialStep: 0,
            menuOpen: false,
            speech: { text: TUTORIAL_STEPS[0].text, type: 'tutorial' },
            emotion: TUTORIAL_STEPS[0].emotion,
        }
        savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
        notify()
    }

    function clickClippy() {
        // During tutorial, clicking Clippy does nothing (use buttons)
        if (state.speech?.type === 'tutorial') return

        // Dismiss any current speech
        if (speechTimer) clearTimeout(speechTimer)

        // Track rapid clicks
        state = { ...state, rapidClicks: state.rapidClicks + 1 }
        totalInteractions++
        savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)

        // Reset rapid click counter after 2s of no clicks
        if (rapidClickTimer) clearTimeout(rapidClickTimer)
        rapidClickTimer = setTimeout(() => {
            state = { ...state, rapidClicks: 0, emotion: state.isHarassed ? 'hurt' : 'idle' }
            notify()
            resetIdleTimer()
        }, 2000)

        // Check for pain reactions (iterate backwards to find highest threshold)
        let reacted = false
        for (let i = PAIN_REACTIONS.length - 1; i >= 0; i--) {
            if (state.rapidClicks >= PAIN_REACTIONS[i].threshold) {
                state = {
                    ...state,
                    speech: { text: PAIN_REACTIONS[i].text, type: 'pain' },
                    emotion: PAIN_REACTIONS[i].emotion,
                    menuOpen: false,
                }

                // Unlock achievement at 25 clicks
                if (state.rapidClicks >= 25 && !state.isHarassed) {
                    unlockAchievement('harceleur')
                    state = { ...state, isHarassed: true }
                    savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
                    startSpamTimerIfNeeded()
                }

                notify()
                reacted = true
                break
            }
        }

        if (!reacted) {
            // Normal click → toggle menu
            state = {
                ...state,
                menuOpen: !state.menuOpen,
                speech: null,
                emotion: 'happy',
            }
            notify()
        }

        if (idleTimer) clearTimeout(idleTimer)
    }

    function showTip() {
        if (speechTimer) clearTimeout(speechTimer)
        const tip = IDLE_TIPS[Math.floor(Math.random() * IDLE_TIPS.length)]
        state = { ...state, speech: { text: tip, type: 'tip' }, menuOpen: false, emotion: 'happy' }
        notify()

        speechTimer = setTimeout(() => {
            state = { ...state, speech: null, emotion: 'idle' }
            notify()
            resetIdleTimer()
        }, 6000)
    }

    function showWhoAmI() {
        if (speechTimer) clearTimeout(speechTimer)
        state = {
            ...state,
            speech: {
                text: "Je suis le portfolio interactif d'Infuseting, un développeur passionné ! Explore les apps pour en savoir plus sur ses projets et compétences. 💻",
                type: 'tip',
            },
            menuOpen: false,
            emotion: 'happy',
        }
        notify()

        speechTimer = setTimeout(() => {
            state = { ...state, speech: null, emotion: 'idle' }
            notify()
            resetIdleTimer()
        }, 8000)
    }

    function suggestGame() {
        if (speechTimer) clearTimeout(speechTimer)
        const games = [
            { name: 'Démineur', emoji: '💣' },
            { name: 'Tetris', emoji: '🧱' },
            { name: 'Slither.io', emoji: '🐍' },
            { name: 'Pinball', emoji: '🪐' },
        ]
        const game = games[Math.floor(Math.random() * games.length)]
        state = {
            ...state,
            speech: {
                text: `Si j'étais toi, je jouerais au ${game.name} ${game.emoji} ! C'est super fun !`,
                type: 'tip',
            },
            menuOpen: false,
            emotion: 'happy',
        }
        notify()

        speechTimer = setTimeout(() => {
            state = { ...state, speech: null, emotion: 'idle' }
            notify()
            resetIdleTimer()
        }, 6000)
    }

    function dismissSpeech() {
        if (speechTimer) clearTimeout(speechTimer)
        state = { ...state, speech: null, emotion: 'idle' }
        notify()
        resetIdleTimer()
    }

    function closeMenu() {
        state = { ...state, menuOpen: false }
        notify()
    }

    function moveClippy(x: number, y: number) {
        state = { ...state, x, y }
        savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
        notify()
    }

    function deleteClippy() {
        state = { ...state, isDeleted: true, visible: false, menuOpen: false, speech: null }
        if (speechTimer) clearTimeout(speechTimer)
        savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
        notify()
    }

    function restoreClippy(isFinalAchievement: boolean = false) {
        state = { ...state, isDeleted: false, visible: true, emotion: 'happy', speech: { text: "Je suis de retour ! Merci de m'avoir sorti de là-dedans.", type: 'welcome' } }

        if (isFinalAchievement) {
            allAchievementsSeen = true
            state.speech = {
                text: "Attends... Tu m'as sorti de là ET tu as débloqué tous les succès ?! Tu es vraiment le meilleur utilisateur que j'ai jamais eu ! 🏆",
                type: 'welcome'
            }
        }

        savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
        unlockAchievement('resto_clippy')
        notify()

        speechTimer = setTimeout(() => {
            state = { ...state, speech: null, emotion: 'idle' }
            notify()
            resetIdleTimer()
        }, 5000)
    }

    function cureClippy() {
        if (!state.isHarassed) return
        state = { ...state, isHarassed: false, emotion: 'happy', speech: { text: "Oh... une rose ? Tu es pardonné. ❤️", type: 'welcome' } }
        savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
        if (spamInterval) {
            clearInterval(spamInterval)
            spamInterval = null
        }
        notify()

        speechTimer = setTimeout(() => {
            state = { ...state, speech: null, emotion: 'idle' }
            notify()
            resetIdleTimer()
        }, 5000)
    }

    function sayAllAchievementsUnlocked() {
        if (allAchievementsSeen || state.isDeleted) return

        if (speechTimer) clearTimeout(speechTimer)
        allAchievementsSeen = true

        let text = "Wouah !! 🎉 Tu as débloqué ABSOLUMENT TOUS les succès de cet ordinateur ! Tu es un vrai explorateur numérique ! GG !! 🏆"
        if (state.isHarassed) {
            text = "Tu as débloqué tous les succès... y compris celui où tu me maltraites. 😒 Mais bon... GG j'imagine. 🏆"
        }

        state = {
            ...state,
            speech: { text, type: 'tip' },
            emotion: state.isHarassed ? 'hurt' : 'happy',
            menuOpen: false,
        }

        savePersistedState(state.tutorialSeen, totalInteractions, state.isHarassed, state.isDeleted, state.x, state.y, allAchievementsSeen)
        notify()

        speechTimer = setTimeout(() => {
            state = { ...state, speech: null, emotion: state.isHarassed ? 'hurt' : 'idle' }
            notify()
            resetIdleTimer()
        }, 8000)
    }

    return {
        get: () => state,
        subscribe: (listener: Listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        initTutorial,
        advanceTutorial,
        skipTutorial,
        restartTutorial,
        clickClippy,
        showTip,
        showWhoAmI,
        suggestGame,
        dismissSpeech,
        closeMenu,
        resetIdleTimer,
        moveClippy,
        deleteClippy,
        restoreClippy,
        cureClippy,
        sayAllAchievementsUnlocked,
    }
}

export type ClippyStore = ReturnType<typeof createClippyStore>

const clippyStore = createClippyStore()

export function useClippy(): ClippyState {
    return useSyncExternalStore(
        clippyStore.subscribe,
        clippyStore.get,
        clippyStore.get,
    )
}

export const initClippyTutorial = () => clippyStore.initTutorial()
export const advanceClippyTutorial = () => clippyStore.advanceTutorial()
export const skipClippyTutorial = () => clippyStore.skipTutorial()
export const restartClippyTutorial = () => clippyStore.restartTutorial()
export const clickClippy = () => clippyStore.clickClippy()
export const showClippyTip = () => clippyStore.showTip()
export const showClippyWhoAmI = () => clippyStore.showWhoAmI()
export const suggestClippyGame = () => clippyStore.suggestGame()
export const dismissClippySpeech = () => clippyStore.dismissSpeech()
export const closeClippyMenu = () => clippyStore.closeMenu()
export const resetClippyIdleTimer = () => clippyStore.resetIdleTimer()
export const moveClippy = (x: number, y: number) => clippyStore.moveClippy(x, y)
export const deleteClippy = () => clippyStore.deleteClippy()
export const restoreClippy = (isFinalAchievement?: boolean) => clippyStore.restoreClippy(isFinalAchievement)
export const cureClippy = () => clippyStore.cureClippy()
export const clippySayAllAchievementsUnlocked = () => clippyStore.sayAllAchievementsUnlocked()
