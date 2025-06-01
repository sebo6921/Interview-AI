export const setupInterviewStyles = {
   
    container: {
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: '15px',
        background: '#1a1a1a',
        color: '#ffffff',
        minHeight: '100vh',
        width: '100%',  // Changed from Width to width
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 0'
    },
    headerTitle: {
        fontSize: '1.8rem',
        fontWeight: '600',
        color: '#ffffff',
        margin: 0
    },
    divider: {
        width: '2px',
        height: '30px',
        background: '#333',
        margin: '0 10px'
    },
    headerSubtext: {
        fontSize: '1.8rem',
        fontWeight: '600',
        color: '#ffffff',
        margin: 0
    },
    videoContainer: {
        marginTop: '2%',
        marginLeft:' 8%',
        background: '#2a2a2a',
        borderRadius: '10px',
        border: '1px solid #404040',
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        maxWidth: '1200px',  // Increased max width
        width: '100%',       // Take full width
    },
    contentWrapper: {
        display: 'flex',
        width: '100%',
        gap: '0px'         // Space between video and config
    },
    videoPlaceholder: {
        flex: '0 0 60%',    // Takes exactly 60% of space
        background: '#333333',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '500px',
    },
    configSection: {
        flex: '0 0 40%',    // Takes exactly 40% of space
        background: '#2d2d2d',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',  // Center horizontally
    },
    video: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scaleX(-1)',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0  // Ensure video is behind information
    },
    continueButton: {
        background: 'rgb(252, 252, 252)',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#404040',
        marginTop: '20px',
        alignSelf: 'center'    // Center button
    },
    welcomeTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: '10px',
        textAlign: 'center'    // Center text
    },
    inputGroup: {
        marginBottom: '10px',
        width: '80%',          // Control width of input groups
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'   // Center inputs
    },
    label: {
        alignItems: 'center',
        display: 'block',
        fontSize: '1rem',
        fontWeight: '500',
        color: '#ffffff',
        marginBottom: '5px'
    },
    input: {
        width: '80%',          // Make inputs wider
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #404040',
        background: '#333333',
        color: '#ffffff',
        textAlign: 'center'    // Center input text
    },
    sectionTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: '2px'
    },
    select: {
        width: '80%',          // Make selects wider
        padding: '10px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: '1px solid #404040',
        background: '#333333',
        color: '#ffffff',
        marginBottom: '5px',
        textAlign: 'center'    // Center select text
    },
    deviceGroup: {
        width: '80%',          // Control width of device group
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'   // Center device controls
    }



};
export default setupInterviewStyles;