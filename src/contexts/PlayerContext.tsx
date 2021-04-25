import { createContext, ReactNode, useContext, useState } from 'react'

export type Episode = {
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    url: string;
}

type PlayerContextData = {
    episodeList: Episode[];
    currentEpisodeIndex: number;
    isPlaying: boolean;
    isPlayingOne: boolean;
    isLooping: boolean;
    isShuffling: boolean;
    play: (episode: Episode) => void;
    playList: (list: Episode[], index: number) => void;
    togglePlay: () => void;
    toggleLoop: () => void;
    toggleShuffle: () => void;
    setPlayingState: (state: boolean) => void;
    playNext: () => void;
    playPrevious: () => void;
}

export const PlayerContext = createContext({} as PlayerContextData)

type PlayerProviderProps = {
    children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
    const [episodeList, setEpisodeList] = useState([] as Episode[])
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [isPlayingOne, setIsPlayingOne] = useState(false);

    function play(episode: Episode) {
        setEpisodeList([episode]);
        setCurrentEpisodeIndex(0);
        setIsPlaying(true);
        setIsPlayingOne(true);
    }

    function playList(list: Episode[], index: number) {
        setEpisodeList(list);
        setCurrentEpisodeIndex(index);
        setIsPlaying(true);
        setIsPlayingOne(false);
    }

    function togglePlay() {
        setIsPlaying(!isPlaying);
    }

    function toggleLoop() {
        setIsLooping(!isLooping);
    }

    function toggleShuffle() {
        setIsShuffling(!isShuffling);
    }

    function setPlayingState(state: boolean) {
        setIsPlaying(state);
    }

    function playNext() {
        if (isShuffling) {
            const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length);
            setCurrentEpisodeIndex(nextRandomEpisodeIndex);
            return;
        }

        const nextEpisodeIndex = currentEpisodeIndex + 1;

        if (nextEpisodeIndex >= episodeList.length) {
            setCurrentEpisodeIndex(0);
            return;
        };

        setCurrentEpisodeIndex(nextEpisodeIndex);
    }

    function playPrevious() {
        const previousEpisodeIndex = currentEpisodeIndex - 1;

        if (previousEpisodeIndex < 0) {
            setCurrentEpisodeIndex(episodeList.length - 1);
            return;
        }

        setCurrentEpisodeIndex(previousEpisodeIndex);
    }

    return (
        <PlayerContext.Provider value={{
            currentEpisodeIndex,
            episodeList,
            isPlaying,
            isPlayingOne,
            play,
            setPlayingState,
            togglePlay,
            playList,
            playNext,
            playPrevious,
            isLooping,
            toggleLoop,
            isShuffling,
            toggleShuffle
        }}>
            {children}
        </PlayerContext.Provider>
    )
}

export const usePlayer = () => useContext(PlayerContext);
