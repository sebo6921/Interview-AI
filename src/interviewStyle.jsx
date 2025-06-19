export const InterviewStyle = {
        container: {
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            background: '#1a1a1a',
            color: '#ffffff',
            minHeight: '100vh',
            lineHeight: '1.5',
            maxWidth: '1470px',
            margin: '0 auto',
        padding: '10px 20px 50px 20px', // Reduced top padding, keep other paddings
            display: 'flex',
            flexDirection: 'column'
        },
        header: {
            textAlign: 'left',
            marginBottom: '32px',
            paddingBottom: '2px',
            borderBottom: '2px solid #333',
            position: 'sticky',  // Add this
            top: 0,             // Add this
            background: '#1a1a1a', // Add this
            padding: '10px 0'    // Add this
        },
        headerText: {
            fontSize: '1.8rem',  // Reduced from 2.5rem
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            margin: 0,
            display: 'flex',    // Add this
            alignItems: 'center' // Add this
        },
        mainContent: {
            
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 400px',
            gap: '32px',
            flex: 1,
            minHeight: 0
        },
        videoContainer: {
            background: '#2a2a2a',
            borderRadius: '8px',
            border: '1px solid #404040',
            overflow: 'hidden',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column'
        },
        videoPlaceholder: {
            flex: 1,
            background: '#333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderBottom: '1px solid #404040'
        },
        video: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            position: 'relative',
            zIndex: 1
        },
        videoLabel: {
            position: 'absolute',
            top: '12px',
            left: '16px',
            background: 'rgba(0, 0, 0, 0.75)',
            padding: '4px 12px',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#ffffff',
            zIndex: 2
        },
        controls: {
            padding: '16px 20px',
            background: '#242424',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px'
        },
        controlBtn: {
            background: '#404040',
            border: '1px solid #555555',
            borderRadius: '6px',
            width: '40px',
            height: '40px',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem'
        },
        transcriptSection: {
            background: '#2a2a2a',
            borderRadius: '8px',
            border: '1px solid #404040',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        transcriptHeader: {
            padding: '20px 24px',
            background: '#242424',
            borderBottom: '1px solid #404040'
        },
        transcriptHeaderTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '4px'
        },
        transcriptSubtitle: {
            fontSize: '0.875rem',
            color: '#aaaaaa'
        },
        transcriptContent: {
            flex: 1,
            padding: '20px 24px',
            overflowY: 'auto',
            maxHeight: '400px'
        },
        transcriptEntry: {
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '6px',
            background: '#333333',
            borderLeft: '4px solid transparent'
        },
        transcriptEntryInterviewer: {
            borderLeftColor: '#0078d4',
            background: '#2d3748'
        },
        transcriptEntryCandidate: {
            borderLeftColor: '#28a745',
            background: '#2d4a32'
        },
        speaker: {
            fontWeight: '600',
            fontSize: '0.875rem',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        speakerInterviewer: {
            color: '#4da6ff'
        },
        speakerCandidate: {
            color: '#5cb85c'
        },
        message: {
            lineHeight: '1.6',
            color: '#e6e6e6',
            fontSize: '0.9rem'
        },
        timestamp: {
            fontSize: '0.75rem',
            color: '#888888',
            marginTop: '8px',
            fontFamily: "'Courier New', monospace"
        },
        statusBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: '#242424',
            borderTop: '1px solid #404040',
            fontSize: '0.875rem'
        },
        statusIndicator: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        statusDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            //background: listening ? '#28a745' : '#6c757d'
        },
        duration: {
            color: '#aaaaaa',
            fontFamily: "'Courier New', monospace"
        },
        currentTranscript: {
            padding: '12px 16px',
            background: '#1e1e1e',
            borderRadius: '6px',
            marginBottom: '16px',
            borderLeft: '4px solid #ffc107'
        },
        sendButton: {
            margin: '20px auto 0',
           // backgroundColor: isLoadingAIResponse ? '#6c757d' : '#007bff',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            border: 'none',
            //cursor: isLoadingAIResponse ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        placeholderIcon: {
            fontSize: '4rem',
            color: '#666666'
        }
    

};
export default InterviewStyle;