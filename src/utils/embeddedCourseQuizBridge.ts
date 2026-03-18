/**
 * Bridge script injected into the embedded course iframe (in-memory HTML only).
 * Runs inside the course context, detects quiz completions via localStorage / ISPlayer,
 * and posts EMBEDDED_QUIZ_RESULT to the parent so the app can store results in Supabase.
 * Does not modify any files in the zip or storage.
 */
export const EMBEDDED_QUIZ_RESULT_MESSAGE_TYPE = 'EMBEDDED_QUIZ_RESULT';

/** Inline script content to inject after ENROLLMENT_ID. Must be valid JS in a single string. */
export function getEmbeddedCourseQuizBridgeScript(): string {
  return `
(function(){
  var enrollmentId = typeof window.ENROLLMENT_ID === 'string' ? window.ENROLLMENT_ID : '';
  if (!enrollmentId) return;
  var sent = {};
  function key(enrollment, quizId) { return enrollment + '::' + quizId; }
  function send(quizIdentifier, slideTitle, score, maxScore, passed) {
    var k = key(enrollmentId, quizIdentifier);
    if (sent[k]) return;
    sent[k] = true;
    try {
      window.parent.postMessage({
        type: '${EMBEDDED_QUIZ_RESULT_MESSAGE_TYPE}',
        enrollmentId: enrollmentId,
        quizIdentifier: String(quizIdentifier),
        slideTitle: slideTitle || null,
        score: score != null ? Number(score) : null,
        maxScore: maxScore != null ? Number(maxScore) : null,
        passed: Boolean(passed)
      }, '*');
    } catch (e) {}
  }
  function findQuizResults(obj, path, index) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.quizInfo && typeof obj.quizInfo === 'object') {
      var qi = obj.quizInfo;
      var state = qi.state;
      var completed = state === 'completed' || state === 'COMPLETED' || qi.quizPassed === true;
      if (completed && (qi.awardedScore != null || qi.awardedPercent != null)) {
        var score = qi.awardedScore != null ? qi.awardedScore : (qi.maxScore != null && qi.awardedPercent != null ? qi.maxScore * qi.awardedPercent : null);
        var maxScore = qi.maxScore != null ? qi.maxScore : null;
        var passed = qi.passed === true || qi.quizPassed === true;
        var quizId = path ? path + '_' + index : (typeof index === 'number' ? 'quiz_' + index : 'quiz_0');
        var slideNum = typeof index === 'number' ? index + 1 : null;
        var rawTitle = (qi.title) || (obj.title) || (obj.name) || (obj.slideInfo && (obj.slideInfo.title || obj.slideInfo.name)) || null;
        var slideTitle = slideNum && rawTitle ? 'Slide ' + slideNum + ' - ' + rawTitle : slideNum ? 'Slide ' + slideNum : rawTitle || null;
        send(quizId, slideTitle, score, maxScore, passed);
      }
    }
    if (Array.isArray(obj)) {
      for (var i = 0; i < obj.length; i++) findQuizResults(obj[i], path || 's', i);
    } else {
      for (var p in obj) if (Object.prototype.hasOwnProperty.call(obj, p)) findQuizResults(obj[p], (path || '') + '.' + p, undefined);
    }
  }
  function poll() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || (k.indexOf('ispring') === -1 && k.indexOf('ISPRING') === -1 && k.indexOf('Ispring') === -1)) continue;
        try {
          var raw = localStorage.getItem(k);
          if (!raw) continue;
          var data = JSON.parse(raw);
          findQuizResults(data);
        } catch (e) {}
      }
    } catch (e) {}
  }
  var interval = setInterval(poll, 2500);
  poll();
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('beforeunload', function() { clearInterval(interval); });
  }
})();
`.replace(/\n/g, ' ');
}
