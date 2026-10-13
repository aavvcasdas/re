"""Fast, dependency-light checks for the tide-and-echo renderer."""
import unittest
from pathlib import Path

import render_tide as tide


class TimelineTests(unittest.TestCase):
    def test_timeline_covers_all_lyrics_without_gaps(self):
        self.assertEqual(len(tide.LYRICS), 32)
        self.assertEqual(tide.LYRICS[:15], tide.LYRICS[15:30])
        self.assertEqual(tide.LYRICS[30:], tide.VERSE[13:15])
        self.assertAlmostEqual(tide.LINE_STARTS[0], tide.INTRO)
        for index, start in enumerate(tide.LINE_STARTS):
            with self.subTest(line=index + 1):
                found, _, _ = tide.lyric_index_at(start + 0.01)
                self.assertEqual(found, index)
                if index + 1 < len(tide.LINE_STARTS):
                    self.assertAlmostEqual(start + tide.LINE_DURS[index], tide.LINE_STARTS[index + 1])
        self.assertAlmostEqual(tide.LINE_STARTS[-1] + tide.LINE_DURS[-1], tide.SONG_END)
        self.assertAlmostEqual(tide.DURATION, 93.5714285714)

    def test_final_couplet_uses_its_own_visual_motifs(self):
        self.assertEqual(tide.section_info(30, tide.LINE_STARTS[30])[0], 13)
        self.assertEqual(tide.section_info(31, tide.LINE_STARTS[31])[0], 14)
        pose = tide.actor_pose(30, 0.5, 0.5, False, True, tide.LINE_STARTS[30] + 1.0)
        self.assertEqual(pose["motif"], 13)


class RenderTests(unittest.TestCase):
    def test_key_frames_are_rgb_16_by_9(self):
        for timestamp in (0.4, 19.6, 36.8, 47.2, 89.3, tide.SONG_END + 1.5):
            with self.subTest(timestamp=timestamp):
                image = tide.render_frame(timestamp, 640, 360)
                self.assertEqual(image.size, (640, 360))
                self.assertEqual(image.mode, "RGB")

    def test_render_is_deterministic_at_a_fixed_time(self):
        first = tide.render_frame(36.8, 320, 180)
        second = tide.render_frame(36.8, 320, 180)
        self.assertEqual(first.tobytes(), second.tobytes())

    def test_optional_recording_is_delayed_and_fit_to_timeline(self):
        command = tide.ffmpeg_command(
            640, 360, 12, Path("test.mp4"), Path("voice.mp3"), 19, tide.INTRO
        )
        audio_filter = command[command.index("-af") + 1]
        self.assertIn("adelay=1429:all=1", audio_filter)
        self.assertIn(f"atrim=duration={tide.DURATION:.3f}", audio_filter)
        self.assertIn("-c:a", command)


if __name__ == "__main__":
    unittest.main()
