import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

import { convertDurationToTimeString } from '../../utils/converteDurationToTimeString';
import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);



  const { 
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    clearPlayerState,
    playPrevious,
    hasNext,
    hasPrevious
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
      return;
    }

    audioRef.current.pause();
  }, [isPlaying]);

  function setUpProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;

    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  const episode = episodeList[currentEpisodeIndex];

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora"/>
        <span>Tocando agora</span>
      </header>

      {
        episode
        ? (
          <div className={styles.currentEpisode}>
            <Image 
              width={592}
              height={592}
              src={episode.thumbnail}
              objectFit='cover'
            />
            <strong>{episode.title}</strong>
            <span>{episode.members}</span>
          </div>
        ) : (
          <div className={styles.emptyPlayer}>
            <strong>Selecione um podcast para ouvir</strong>
          </div>
        )
      }

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {
              episode
                ? (
                  <Slider
                    max={episode.duration}
                    value={progress}
                    onChange={handleSeek}
                    trackStyle={{ backgroundColor: '#04D361' }}
                    railStyle={{ backgroundColor: '#9f75FF' }}
                    handleStyle={{ borderColor: '#04D361', borderWidth: 4 }}
                  />
                ) : (
                  <div className={styles.emptySlider} />
                )
            }
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {
          episode && (
            <audio
              src={episode.url}
              ref={audioRef}
              loop={isLooping}
              autoPlay
              onEnded={handleEpisodeEnded}
              onPlay={() => setPlayingState(true)}
              onPause={() => setPlayingState(false)}
              onLoadedMetadata={setUpProgressListener}
            />
          )
        }

        <div className={styles.buttons}>
          <button
            type='button'
            onClick={toggleShuffle}
            disabled={!episode || episodeList.length === 1}
            className={isShuffling ? styles.isActive : ''}
          >
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>

          <button 
            type='button'
            onClick={playPrevious}
            disabled={!episode || !hasPrevious}
          >
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>

          <button
            type='button'
            className={styles.playButton}
            onClick={togglePlay}
            disabled={!episode}
          >
            {
              isPlaying
                ? <img src="/pause.svg" alt="Tocar" />
                : <img src="/play.svg" alt="Tocar" />
            }
          </button>

          <button
            type='button'
            onClick={playNext}
            disabled={!episode || !hasNext}
          >
            <img src="/play-next.svg" alt="Tocar pr??xima" />
          </button>

          <button
            type='button'
            onClick={toggleLoop}
            disabled={!episode}
            className={isLooping ? styles.isActive : ''}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>
    </div>
  );
}
